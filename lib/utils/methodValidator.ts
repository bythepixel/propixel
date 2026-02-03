import type { NextApiRequest, NextApiResponse } from 'next'

export function validateMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.setHeader('Allow', allowedMethods)
    res.status(405).end(`Method ${req.method} Not Allowed`)
    return false
  }
  return true
}
