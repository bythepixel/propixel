export const BCRYPT_ROUNDS = 10

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Duplicate entry',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
} as const

export const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
} as const
