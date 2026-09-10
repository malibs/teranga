import test from 'node:test'
import assert from 'node:assert/strict'

import { hashPassword, verifyPassword } from './auth-utils.js'

test('hashPassword and verifyPassword work together', async () => {
  const password = 'Teranga123!'
  const hash = await hashPassword(password)

  assert.ok(hash.startsWith('pbkdf2_sha256$'))
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('wrong-password', hash), false)
})
