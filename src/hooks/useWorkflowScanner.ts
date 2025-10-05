import { useEffect } from 'react'
import { runWorkflowAutomation } from '@/services/workflow/workflowAutomationService'

export function useWorkflowScanner(scanData: any, facilityId: string) {
  useEffect(() => {
    if (!scanData || !scanData.type) return

    async function handleScan() {
      try {
        await runWorkflowAutomation({ scanData, facilityId })
        if (process.env.NODE_ENV === 'development') {
          console.debug(`⚙️ Workflow automation triggered for ${scanData.type}`)
        }
      } catch (err: any) {
        console.error('Workflow automation failed:', err.message)
      }
    }

    handleScan()
  }, [scanData, facilityId])
}