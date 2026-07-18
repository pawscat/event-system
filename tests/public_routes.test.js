const http = require('http')

async function runTests() {
  console.log('--- Mulai Testing Routing Middleware ---')
  console.log('Pastikan `npm run dev` sedang berjalan di http://localhost:3000\n')

  const PORT = 3000
  const HOST = 'localhost'

  const request = (path) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: HOST,
        port: PORT,
        path: path,
        method: 'GET',
        headers: {
          'Cookie': '' // Simulate unauthenticated user
        }
      }

      const req = http.request(options, (res) => {
        resolve(res.statusCode)
      })

      req.on('error', (e) => {
        reject(e)
      })

      req.end()
    })
  }

  try {
    // Test 1: Public route '/'
    const statusRoot = await request('/')
    if (statusRoot === 200) {
      console.log('V GET / -> 200 OK (Berhasil, tidak diredirect)')
    } else {
      console.error(`X GET / -> ${statusRoot} (Gagal, seharusnya 200)`)
    }

    // Test 2: Public route '/register/demo'
    const statusRegister = await request('/register/demo')
    if (statusRegister === 200 || statusRegister === 404) {
      // 404 is also fine because the event might not exist, but it's not a 307 redirect to login
      console.log(`V GET /register/demo -> ${statusRegister} (Berhasil, tidak diblokir login)`)
    } else if (statusRegister === 307 || statusRegister === 302) {
      console.error(`X GET /register/demo -> ${statusRegister} (Gagal, seharusnya bisa diakses publik)`)
    } else {
      console.log(`- GET /register/demo -> ${statusRegister}`)
    }

    // Test 3: Private route '/dashboard'
    const statusDashboard = await request('/dashboard')
    if (statusDashboard === 307 || statusDashboard === 302) {
      console.log('V GET /dashboard -> 307/302 Redirect (Berhasil diblokir ke /login)')
    } else {
      console.error(`X GET /dashboard -> ${statusDashboard} (Gagal, seharusnya diredirect ke login)`)
    }

    // Test 4: Auth route '/login'
    const statusLogin = await request('/login')
    if (statusLogin === 200) {
      console.log('V GET /login -> 200 OK (Berhasil diakses)')
    } else {
      console.error(`X GET /login -> ${statusLogin} (Gagal, seharusnya 200)`)
    }

  } catch (error) {
    console.error('Error saat testing:', error.message)
    console.log('\nMohon jalankan "npm run dev" terlebih dahulu sebelum menjalankan test ini.')
  }

  console.log('\n--- Testing Selesai ---')
}

runTests()
