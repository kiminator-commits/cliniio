// Threat intelligence integration for enhanced security
interface ThreatIntelligenceConfig {
  enableAbuseIPDB: boolean;
  enableVirusTotal: boolean;
  enableShodan: boolean;
  enableCustomFeeds: boolean;
  cacheDurationMinutes: number;
  maxRetries: number;
  timeoutMs: number;
}

interface ThreatData {
  ip: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  sources: string[];
  lastSeen: string;
  reputation: number; // 0-100, higher is better
  categories: string[];
  confidence: number; // 0-100
  rawData: any;
}

interface ThreatIntelligenceResult {
  isThreat: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  sources: string[];
  details: string;
  recommendations: string[];
}

class ThreatIntelligenceService {
  private config: ThreatIntelligenceConfig;
  private cache = new Map<string, { data: ThreatData; expires: number }>();
  private knownThreats = new Set<string>();
  private knownGoodIPs = new Set<string>();

  constructor(config: Partial<ThreatIntelligenceConfig> = {}) {
    this.config = {
      enableAbuseIPDB: config.enableAbuseIPDB || false,
      enableVirusTotal: config.enableVirusTotal || false,
      enableShodan: config.enableShodan || false,
      enableCustomFeeds: config.enableCustomFeeds || true,
      cacheDurationMinutes: config.cacheDurationMinutes || 60,
      maxRetries: config.maxRetries || 3,
      timeoutMs: config.timeoutMs || 5000,
    };

    this.loadKnownThreats();
  }

  private async loadKnownThreats(): Promise<void> {
    try {
      // Load from environment variables or external sources
      const threatIPs = Deno.env.get('KNOWN_THREAT_IPS')?.split(',') || [];
      const goodIPs = Deno.env.get('KNOWN_GOOD_IPS')?.split(',') || [];

      threatIPs.forEach(ip => {
        if (ip.trim()) this.knownThreats.add(ip.trim());
      });

      goodIPs.forEach(ip => {
        if (ip.trim()) this.knownGoodIPs.add(ip.trim());
      });

      console.log(`Loaded ${this.knownThreats.size} known threat IPs and ${this.knownGoodIPs.size} known good IPs`);
    } catch (error) {
      console.error('Failed to load known threats:', error);
    }
  }

  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    
    // Check for private IP ranges
    return (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 127) // localhost
    );
  }

  private async checkCache(ip: string): Promise<ThreatData | null> {
    const cached = this.cache.get(ip);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(ip);
    }
    
    return null;
  }

  private setCache(ip: string, data: ThreatData): void {
    const expires = Date.now() + (this.config.cacheDurationMinutes * 60 * 1000);
    this.cache.set(ip, { data, expires });
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Cliniio-Security-Scanner/1.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async checkAbuseIPDB(ip: string): Promise<ThreatData | null> {
    if (!this.config.enableAbuseIPDB) return null;

    const apiKey = Deno.env.get('ABUSEIPDB_API_KEY');
    if (!apiKey) return null;

    try {
      const response = await this.makeRequest(
        `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
        {
          headers: {
            'Key': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const result = data.data;

      return {
        ip,
        threatLevel: result.abuseConfidencePercentage > 75 ? 'critical' :
                   result.abuseConfidencePercentage > 50 ? 'high' :
                   result.abuseConfidencePercentage > 25 ? 'medium' : 'low',
        sources: ['AbuseIPDB'],
        lastSeen: result.lastReportedAt || new Date().toISOString(),
        reputation: 100 - result.abuseConfidencePercentage,
        categories: result.usageType ? [result.usageType] : [],
        confidence: result.abuseConfidencePercentage,
        rawData: result,
      };
    } catch (error) {
      console.error('AbuseIPDB check failed:', error);
      return null;
    }
  }

  private async checkVirusTotal(ip: string): Promise<ThreatData | null> {
    if (!this.config.enableVirusTotal) return null;

    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) return null;

    try {
      const response = await this.makeRequest(
        `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
        {
          headers: {
            'X-Apikey': apiKey,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const stats = data.data.attributes.last_analysis_stats;

      const maliciousCount = stats.malicious || 0;
      const suspiciousCount = stats.suspicious || 0;
      const totalEngines = Object.values(stats).reduce((sum: number, count: any) => sum + count, 0);

      const threatScore = (maliciousCount * 2 + suspiciousCount) / totalEngines * 100;

      return {
        ip,
        threatLevel: threatScore > 50 ? 'critical' :
                   threatScore > 25 ? 'high' :
                   threatScore > 10 ? 'medium' : 'low',
        sources: ['VirusTotal'],
        lastSeen: data.data.attributes.last_analysis_date ? 
                 new Date(data.data.attributes.last_analysis_date * 1000).toISOString() : 
                 new Date().toISOString(),
        reputation: Math.max(0, 100 - threatScore),
        categories: data.data.attributes.categories ? Object.keys(data.data.attributes.categories) : [],
        confidence: threatScore,
        rawData: data.data,
      };
    } catch (error) {
      console.error('VirusTotal check failed:', error);
      return null;
    }
  }

  private async checkShodan(ip: string): Promise<ThreatData | null> {
    if (!this.config.enableShodan) return null;

    const apiKey = Deno.env.get('SHODAN_API_KEY');
    if (!apiKey) return null;

    try {
      const response = await this.makeRequest(
        `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      
      // Analyze Shodan data for threat indicators
      const threatIndicators = [];
      let threatScore = 0;

      if (data.vulns && data.vulns.length > 0) {
        threatIndicators.push('Known vulnerabilities');
        threatScore += data.vulns.length * 10;
      }

      if (data.tags && data.tags.includes('malware')) {
        threatIndicators.push('Malware detected');
        threatScore += 50;
      }

      if (data.tags && data.tags.includes('botnet')) {
        threatIndicators.push('Botnet member');
        threatScore += 75;
      }

      return {
        ip,
        threatLevel: threatScore > 75 ? 'critical' :
                   threatScore > 50 ? 'high' :
                   threatScore > 25 ? 'medium' : 'low',
        sources: ['Shodan'],
        lastSeen: new Date().toISOString(),
        reputation: Math.max(0, 100 - threatScore),
        categories: data.tags || [],
        confidence: Math.min(100, threatScore),
        rawData: data,
      };
    } catch (error) {
      console.error('Shodan check failed:', error);
      return null;
    }
  }

  private async checkCustomFeeds(ip: string): Promise<ThreatData | null> {
    if (!this.config.enableCustomFeeds) return null;

    // Check known threat lists
    if (this.knownThreats.has(ip)) {
      return {
        ip,
        threatLevel: 'critical',
        sources: ['Custom Threat Feed'],
        lastSeen: new Date().toISOString(),
        reputation: 0,
        categories: ['Known Threat'],
        confidence: 100,
        rawData: { source: 'custom_feed' },
      };
    }

    // Check known good IPs
    if (this.knownGoodIPs.has(ip)) {
      return {
        ip,
        threatLevel: 'low',
        sources: ['Custom Good IP Feed'],
        lastSeen: new Date().toISOString(),
        reputation: 100,
        categories: ['Known Good'],
        confidence: 100,
        rawData: { source: 'custom_good_feed' },
      };
    }

    return null;
  }

  private async checkGeolocation(ip: string): Promise<ThreatData | null> {
    try {
      // Use a free geolocation service
      const response = await this.makeRequest(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.status !== 'success') return null;

      // Check for suspicious countries/regions
      const suspiciousCountries = ['CN', 'RU', 'KP', 'IR']; // Add more as needed
      const suspiciousISPs = ['tor', 'proxy', 'vpn', 'hosting'];

      let threatScore = 0;
      const categories = [];

      if (suspiciousCountries.includes(data.countryCode)) {
        threatScore += 20;
        categories.push('Suspicious Country');
      }

      if (data.isp && suspiciousISPs.some(isp => data.isp.toLowerCase().includes(isp))) {
        threatScore += 30;
        categories.push('Suspicious ISP');
      }

      return {
        ip,
        threatLevel: threatScore > 40 ? 'medium' : 'low',
        sources: ['IP Geolocation'],
        lastSeen: new Date().toISOString(),
        reputation: Math.max(0, 100 - threatScore),
        categories,
        confidence: threatScore,
        rawData: data,
      };
    } catch (error) {
      console.error('Geolocation check failed:', error);
      return null;
    }
  }

  async analyzeThreat(ip: string): Promise<ThreatIntelligenceResult> {
    // Skip private IPs
    if (this.isPrivateIP(ip)) {
      return {
        isThreat: false,
        threatLevel: 'low',
        confidence: 100,
        sources: ['Private IP'],
        details: 'Private IP address - no external threat analysis needed',
        recommendations: ['Allow - private network'],
      };
    }

    // Check cache first
    const cached = await this.checkCache(ip);
    if (cached) {
      return this.processThreatData(cached);
    }

    // Run all threat intelligence checks in parallel
    const checks = await Promise.allSettled([
      this.checkAbuseIPDB(ip),
      this.checkVirusTotal(ip),
      this.checkShodan(ip),
      this.checkCustomFeeds(ip),
      this.checkGeolocation(ip),
    ]);

    const threatData: ThreatData[] = [];
    const sources: string[] = [];

    checks.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        threatData.push(result.value);
        sources.push(...result.value.sources);
      }
    });

    if (threatData.length === 0) {
      // No threat data available
      const result: ThreatIntelligenceResult = {
        isThreat: false,
        threatLevel: 'low',
        confidence: 0,
        sources: ['No Data'],
        details: 'No threat intelligence data available',
        recommendations: ['Monitor - no data available'],
      };

      // Cache the result
      this.setCache(ip, {
        ip,
        threatLevel: 'low',
        sources: ['No Data'],
        lastSeen: new Date().toISOString(),
        reputation: 50,
        categories: [],
        confidence: 0,
        rawData: {},
      });

      return result;
    }

    // Aggregate threat data
    const aggregated = this.aggregateThreatData(threatData);
    
    // Cache the result
    this.setCache(ip, aggregated);

    return this.processThreatData(aggregated);
  }

  private aggregateThreatData(threatData: ThreatData[]): ThreatData {
    const ip = threatData[0].ip;
    const sources = [...new Set(threatData.flatMap(td => td.sources))];
    const categories = [...new Set(threatData.flatMap(td => td.categories))];

    // Calculate weighted threat level
    const threatLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalWeight = threatData.reduce((sum, td) => sum + td.confidence, 0);
    const weightedThreat = threatData.reduce((sum, td) => 
      sum + (threatLevels[td.threatLevel] * td.confidence), 0
    ) / totalWeight;

    let threatLevel: 'low' | 'medium' | 'high' | 'critical';
    if (weightedThreat >= 3.5) threatLevel = 'critical';
    else if (weightedThreat >= 2.5) threatLevel = 'high';
    else if (weightedThreat >= 1.5) threatLevel = 'medium';
    else threatLevel = 'low';

    // Calculate average reputation
    const avgReputation = threatData.reduce((sum, td) => sum + td.reputation, 0) / threatData.length;

    return {
      ip,
      threatLevel,
      sources,
      lastSeen: new Date().toISOString(),
      reputation: avgReputation,
      categories,
      confidence: Math.min(100, totalWeight / threatData.length),
      rawData: threatData.reduce((acc, td) => ({ ...acc, ...td.rawData }), {}),
    };
  }

  private processThreatData(threatData: ThreatData): ThreatIntelligenceResult {
    const isThreat = threatData.threatLevel === 'high' || threatData.threatLevel === 'critical';
    
    let details = `IP ${threatData.ip} has ${threatData.threatLevel} threat level`;
    if (threatData.categories.length > 0) {
      details += ` with categories: ${threatData.categories.join(', ')}`;
    }
    details += `. Reputation score: ${threatData.reputation.toFixed(1)}/100`;

    const recommendations: string[] = [];
    
    if (threatData.threatLevel === 'critical') {
      recommendations.push('Block immediately');
      recommendations.push('Investigate further');
    } else if (threatData.threatLevel === 'high') {
      recommendations.push('Consider blocking');
      recommendations.push('Monitor closely');
    } else if (threatData.threatLevel === 'medium') {
      recommendations.push('Monitor');
      recommendations.push('Rate limit');
    } else {
      recommendations.push('Allow');
      recommendations.push('Normal monitoring');
    }

    return {
      isThreat,
      threatLevel: threatData.threatLevel,
      confidence: threatData.confidence,
      sources: threatData.sources,
      details,
      recommendations,
    };
  }

  async getThreatStatistics(): Promise<{
    totalAnalyzed: number;
    threatsDetected: number;
    threatLevels: Record<string, number>;
    topSources: Record<string, number>;
  }> {
    const stats = {
      totalAnalyzed: this.cache.size,
      threatsDetected: 0,
      threatLevels: { low: 0, medium: 0, high: 0, critical: 0 },
      topSources: {} as Record<string, number>,
    };

    for (const [, { data }] of this.cache) {
      if (data.threatLevel === 'high' || data.threatLevel === 'critical') {
        stats.threatsDetected++;
      }
      
      stats.threatLevels[data.threatLevel]++;
      
      data.sources.forEach(source => {
        stats.topSources[source] = (stats.topSources[source] || 0) + 1;
      });
    }

    return stats;
  }
}

// Export singleton instance
let threatIntelligenceService: ThreatIntelligenceService | null = null;

export function getThreatIntelligenceService(): ThreatIntelligenceService {
  if (!threatIntelligenceService) {
    threatIntelligenceService = new ThreatIntelligenceService({
      enableAbuseIPDB: Deno.env.get('ENABLE_ABUSEIPDB') === 'true',
      enableVirusTotal: Deno.env.get('ENABLE_VIRUSTOTAL') === 'true',
      enableShodan: Deno.env.get('ENABLE_SHODAN') === 'true',
      enableCustomFeeds: true,
      cacheDurationMinutes: 60,
      maxRetries: 3,
      timeoutMs: 5000,
    });
  }

  return threatIntelligenceService;
}

export { ThreatIntelligenceService, type ThreatIntelligenceResult, type ThreatData };
