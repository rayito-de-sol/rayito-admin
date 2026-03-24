import { apiClient } from '../client'

/**
 * Auth API endpoints
 */

/**
 * Response from email validation endpoint
 */
export interface EmailValidationResponse {
  allowed: boolean
  message?: string
}

export const authApi = {
  /**
   * Validate if an email is in the backend whitelist
   * @param email - Email address to validate
   * @returns Promise with validation result
   */
  async validateEmail(email: string): Promise<EmailValidationResponse> {
    const response = await apiClient.get<EmailValidationResponse>(
      '/auth/validate-email',
      {
        params: { email },
      }
    )
    return response.data
  },
}
