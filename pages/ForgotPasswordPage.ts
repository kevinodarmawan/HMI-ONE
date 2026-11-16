import { expect, type Locator, type Page } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly sendResetEmailButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.sendResetEmailButton = page.getByRole('button', {
      name: 'Send Password Reset Email',
    });
  }

  async requestReset(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.sendResetEmailButton.click();
  }

  async expectResetSent(): Promise<void> {
    await expect(this.page.getByText('Reset password email sent')).toBeVisible();
  }
}
