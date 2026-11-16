import { expect, type Locator, type Page } from '@playwright/test';
import { waitForTransitionRender } from '../utils/waitForTransitionRender';

export class LoginPage {
  readonly page: Page;
  readonly loginRegisterButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginRegisterButton = page.getByRole('button', { name: 'Log In / Register' });
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.passwordInput = page.getByRole('textbox', { name: 'Enter your Password' });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot your password?' });
  }

  async open(renderDelayMs = 0): Promise<void> {
    await this.page.goto('/');
    await this.loginRegisterButton.click();
    await expect(this.page.getByRole('heading', { name: 'Log In' })).toBeVisible();
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async login(email: string, password: string, renderDelayMs = 0): Promise<void> {
    await this.open(renderDelayMs);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/\/dashboard\/?$/, { timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async openPasswordReset(renderDelayMs = 0): Promise<void> {
    await this.forgotPasswordLink.click();
    await expect(this.page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await waitForTransitionRender(this.page, renderDelayMs);
  }
}
