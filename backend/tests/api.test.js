const assert = require('assert');
const http = require('http');
const { app, startServer } = require('../src/index');
const { sequelize, User, Category, Task } = require('../src/models');

const request = async (server, method, path, data = null, token = null) => {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch (e) {
            parsed = body;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Starting API Integration & Security Tests...\n');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Health check
    console.log('Test 1: Health check');
    const health = await request(server, 'GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'ok');
    console.log('  Passed!');

    // 2. Register validation error (Zod)
    console.log('Test 2: Register validation rejection (short password, bad email)');
    const badReg = await request(server, 'POST', '/api/auth/register', {
      name: '',
      email: 'not-an-email',
      password: '123'
    });
    assert.strictEqual(badReg.status, 400);
    assert.strictEqual(badReg.body.success, false);
    assert.ok(badReg.body.errors.email, 'Should have email error');
    assert.ok(badReg.body.errors.password, 'Should have password error');
    console.log('  Passed! Error response formatted properly:', badReg.body.errors);

    // 3. Register valid user A
    console.log('Test 3: Register User A');
    const userAEmail = `user_a_${Date.now()}@example.com`;
    const regRes = await request(server, 'POST', '/api/auth/register', {
      name: 'Alice Developer',
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regRes.body.success, true);
    assert.ok(regRes.body.token, 'Should return JWT token');
    assert.strictEqual(regRes.body.user.email, userAEmail);
    assert.strictEqual(regRes.body.user.passwordHash, undefined, 'Must not return passwordHash');
    const tokenA = regRes.body.token;
    console.log('  Passed! Token generated and user created.');

    // 4. Duplicate register rejection (409)
    console.log('Test 4: Reject duplicate registration with 409 Conflict');
    const dupReg = await request(server, 'POST', '/api/auth/register', {
      name: 'Alice Duplicate',
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(dupReg.status, 409);
    assert.strictEqual(dupReg.body.success, false);
    console.log('  Passed!');

    // 5. Login
    console.log('Test 5: Login with valid credentials');
    const loginRes = await request(server, 'POST', '/api/auth/login', {
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.body.token);
    console.log('  Passed!');

    // 6. Login invalid credentials (401)
    console.log('Test 6: Reject login with wrong password');
    const badLogin = await request(server, 'POST', '/api/auth/login', {
      email: userAEmail,
      password: 'WrongPassword'
    });
    assert.strictEqual(badLogin.status, 401);
    console.log('  Passed!');

    // 7. Get Me
    console.log('Test 7: Protected GET /api/auth/me');
    const meRes = await request(server, 'GET', '/api/auth/me', null, tokenA);
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.email, userAEmail);
    console.log('  Passed!');

    // 8. Category CRUD for User A
    console.log('Test 8: Category CRUD for User A');
    const catRes = await request(
      server,
      'POST',
      '/api/categories',
      { name: 'Backend Ops' },
      tokenA
    );
    assert.strictEqual(catRes.status, 201);
    const catAId = catRes.body.data.id;
    assert.ok(catAId);

    const getCats = await request(server, 'GET', '/api/categories', null, tokenA);
    assert.strictEqual(getCats.status, 200);
    assert.ok(getCats.body.data.length >= 1);
    console.log('  Passed!');

    // 9. Task CRUD for User A
    console.log('Test 9: Task CRUD for User A');
    const taskRes = await request(
      server,
      'POST',
      '/api/tasks',
      {
        title: 'Configure CI/CD Pipelines',
        description: 'Set up GitHub Actions to deploy on merge',
        status: 'PENDING',
        categoryId: catAId
      },
      tokenA
    );
    assert.strictEqual(taskRes.status, 201);
    const taskAId = taskRes.body.data.id;
    assert.strictEqual(taskRes.body.data.title, 'Configure CI/CD Pipelines');
    assert.strictEqual(taskRes.body.data.category.name, 'Backend Ops');

    // Filter tasks
    const pendingTasks = await request(
      server,
      'GET',
      '/api/tasks?status=PENDING',
      null,
      tokenA
    );
    assert.strictEqual(pendingTasks.status, 200);
    assert.ok(pendingTasks.body.data.some((t) => t.id === taskAId));

    // Update task
    const updateRes = await request(
      server,
      'PATCH',
      `/api/tasks/${taskAId}`,
      { status: 'COMPLETED' },
      tokenA
    );
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.data.status, 'COMPLETED');
    console.log('  Passed!');

    // 10. Security & Ownership Isolation Check with User B
    console.log('Test 10: User Ownership & Isolation Enforcement (User B vs User A)');
    const userBEmail = `user_b_${Date.now()}@example.com`;
    const regB = await request(server, 'POST', '/api/auth/register', {
      name: 'Bob Developer',
      email: userBEmail,
      password: 'Password123!'
    });
    const tokenB = regB.body.token;

    // User B cannot read User A's task
    const bGetTask = await request(server, 'GET', `/api/tasks/${taskAId}`, null, tokenB);
    assert.strictEqual(bGetTask.status, 404, 'User B must not see User A task');

    // User B cannot update User A's task
    const bUpdateTask = await request(
      server,
      'PATCH',
      `/api/tasks/${taskAId}`,
      { title: 'Hacked by B' },
      tokenB
    );
    assert.strictEqual(bUpdateTask.status, 404, 'User B must not update User A task');

    // User B cannot delete User A's task
    const bDeleteTask = await request(
      server,
      'DELETE',
      `/api/tasks/${taskAId}`,
      null,
      tokenB
    );
    assert.strictEqual(bDeleteTask.status, 404, 'User B must not delete User A task');

    // User B cannot create task pointing to User A's category
    const bCreateTaskWithCatA = await request(
      server,
      'POST',
      '/api/tasks',
      {
        title: 'Task using Cat A',
        categoryId: catAId
      },
      tokenB
    );
    assert.strictEqual(
      bCreateTaskWithCatA.status,
      400,
      'User B must not assign User A category'
    );

    // User B cannot read User A's category
    const bGetCat = await request(
      server,
      'GET',
      `/api/categories/${catAId}`,
      null,
      tokenB
    );
    assert.strictEqual(bGetCat.status, 404, 'User B must not read User A category');

    console.log('  Passed! Full ownership boundary verified.');

    // 11. Unauthenticated request rejection (401)
    console.log('Test 11: Unauthenticated request rejection');
    const noAuth = await request(server, 'GET', '/api/tasks');
    assert.strictEqual(noAuth.status, 401);
    const badToken = await request(server, 'GET', '/api/tasks', null, 'invalid.jwt.token');
    assert.strictEqual(badToken.status, 401);
    console.log('  Passed!');

    // 12. Forgot password request (valid user)
    console.log('Test 12: Request password reset token');
    const forgotRes = await request(server, 'POST', '/api/auth/forgot-password', {
      email: userAEmail
    });
    assert.strictEqual(forgotRes.status, 200);
    assert.strictEqual(forgotRes.body.success, true);
    assert.ok(forgotRes.body.devToken, 'Should return devToken in non-production mode');
    const rawResetToken = forgotRes.body.devToken;
    console.log('  Passed! Reset token issued.');

    // 13. Forgot password request (non-existent user, anti-enumeration)
    console.log('Test 13: Anti-enumeration check on unknown email');
    const unknownForgot = await request(server, 'POST', '/api/auth/forgot-password', {
      email: 'nonexistent_user_9999@example.com'
    });
    assert.strictEqual(unknownForgot.status, 200);
    assert.strictEqual(unknownForgot.body.success, true);
    assert.strictEqual(unknownForgot.body.devToken, undefined);
    console.log('  Passed! Secure generic response returned.');

    // 14. Verify reset token
    console.log('Test 14: Verify reset token validity');
    const validVerify = await request(server, 'GET', `/api/auth/verify-reset-token?token=${rawResetToken}`);
    assert.strictEqual(validVerify.status, 200);
    assert.strictEqual(validVerify.body.valid, true);
    assert.strictEqual(validVerify.body.email, userAEmail);

    const badVerify = await request(server, 'GET', '/api/auth/verify-reset-token?token=invalid_token_12345');
    assert.strictEqual(badVerify.status, 400);
    assert.strictEqual(badVerify.body.valid, false);
    console.log('  Passed! Token verification accurate.');

    // 15. Reset password and verify login
    console.log('Test 15: Reset password and verify login credentials');
    const newSecretPassword = 'BrandNewPassword2026!';
    const resetRes = await request(server, 'POST', '/api/auth/reset-password', {
      token: rawResetToken,
      password: newSecretPassword
    });
    assert.strictEqual(resetRes.status, 200);
    assert.strictEqual(resetRes.body.success, true);

    // Old password must fail
    const oldLoginFail = await request(server, 'POST', '/api/auth/login', {
      email: userAEmail,
      password: 'Password123!'
    });
    assert.strictEqual(oldLoginFail.status, 401, 'Old password must no longer work');

    // New password must succeed
    const newLoginSuccess = await request(server, 'POST', '/api/auth/login', {
      email: userAEmail,
      password: newSecretPassword
    });
    assert.strictEqual(newLoginSuccess.status, 200, 'New password must log in successfully');
    assert.ok(newLoginSuccess.body.token);

    // Reusing the same reset token must fail
    const reuseFail = await request(server, 'POST', '/api/auth/reset-password', {
      token: rawResetToken,
      password: 'AnotherPassword!'
    });
    assert.strictEqual(reuseFail.status, 400, 'Reset token must be single-use only');
    console.log('  Passed! Full reset lifecycle and security verified.');

    console.log('\n🎉 ALL 15 TEST SUITES PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
