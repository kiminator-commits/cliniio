# 🔐 Environment Variables Setup Guide

## Overview

This guide shows you how to properly configure environment variables for Cliniio without exposing sensitive credentials in source code.

## 🚨 Security Requirements

- **NO hardcoded credentials** in source code
- **Environment variables only** for sensitive data
- **Different keys** for development/staging/production
- **Regular rotation** of API keys

## 📋 Required Environment Variables

### Supabase Configuration (REQUIRED)

```bash
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anonymous/public key
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Your Supabase service role key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### AI Service Configuration (OPTIONAL)

```bash
# OpenAI API Key for AI features
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Note: All AI features are powered by OpenAI GPT-4o.

# Google Vision API Key
VITE_GOOGLE_VISION_API_KEY=your_google_vision_api_key_here

# Azure Computer Vision API Key
VITE_AZURE_VISION_API_KEY=your_azure_vision_api_key_here

# Azure Computer Vision Endpoint
VITE_AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com
```

### Application Configuration (OPTIONAL)

```bash
# Application environment
NODE_ENV=development

# Enable/disable features
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

## 🛠️ Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# Copy the template
cp docs/ENVIRONMENT_SETUP.md .env.local

# Edit with your actual values
nano .env.local
```

### 2. Fill in Your Values

Replace the placeholder values with your actual credentials:

```bash
# Example (DO NOT use these values)
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Restart Development Server

```bash
npm run dev
```

### 4. Verify Configuration

```bash
# Check security configuration
npm run check:security

# Or manually verify
node -e "console.log('Supabase URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing')"
```

## 🔒 Security Best Practices

### API Key Security

- **Minimum length**: 20 characters
- **No test/mock credentials** in production
- **Regular rotation**: Every 90 days
- **Environment isolation**: Different keys per environment

### Development Security

- **Never commit** `.env.local` to git
- **Use mock services** for development when possible
- **Local testing only** with development keys
- **Secure credential storage** on development machines

### Production Security

- **Environment-specific** configuration
- **Secret management** service (AWS Secrets Manager, Azure Key Vault)
- **Access logging** for all credential usage
- **Incident response** plan for credential compromise

## 🚨 Common Security Mistakes

### ❌ Don't Do This

```typescript
// NEVER hardcode credentials
const API_KEY = 'sk-1234567890abcdef';

// NEVER use test credentials in production
const SUPABASE_URL = 'https://test.supabase.co';

// NEVER log sensitive data
console.log('API Key:', process.env.VITE_API_KEY);
```

### ✅ Do This Instead

```typescript
// Use environment variables
const API_KEY = getEnvVar('VITE_API_KEY');

// Validate configuration
if (!API_KEY) {
  throw new Error('Missing API key configuration');
}

// Sanitize for logging
console.log('API Key configured:', API_KEY ? 'Yes' : 'No');
```

## 🔍 Troubleshooting

### Configuration Issues

```bash
# Check if environment variables are loaded
npm run check:env

# Verify Supabase connection
npm run check:supabase

# Test AI service configuration
npm run check:ai
```

### Common Errors

1. **"Missing Supabase configuration"**
   - Check `.env.local` file exists
   - Verify variable names are correct
   - Restart development server

2. **"Invalid API key"**
   - Check key length (minimum 20 characters)
   - Verify key format (no extra spaces)
   - Test key with service provider

3. **"Environment not loaded"**
   - Ensure file is named `.env.local`
   - Check file is in project root
   - Verify no syntax errors in file

## 📊 Security Checklist

- [ ] `.env.local` file created
- [ ] All required variables set
- [ ] No hardcoded credentials in source
- [ ] Development server restarted
- [ ] Configuration verified
- [ ] Security check passed
- [ ] `.env.local` added to `.gitignore`

## 🆘 Getting Help

If you encounter security issues:

1. **Check the logs** for specific error messages
2. **Verify environment variables** are loaded
3. **Test configuration** with security check
4. **Review this guide** for common solutions
5. **Contact security team** for critical issues

## 🔄 Regular Maintenance

- **Monthly**: Review API key usage
- **Quarterly**: Rotate API keys
- **Annually**: Security configuration audit
- **As needed**: Update after security incidents

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for help rather than taking shortcuts.
