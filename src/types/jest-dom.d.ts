/// <reference types="@testing-library/jest-dom" />

// Déclaration des types Jest DOM pour TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveAttribute(attr: string, value?: string): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | string[]): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeChecked(): R
      toHaveFocus(): R
    }
  }
}

export {}