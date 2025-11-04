// Script untuk test koneksi Supabase
// Jalankan di browser console untuk debugging

console.log("🔍 Testing Supabase connection...");

// Test 1: Cek apakah Supabase client tersedia
if (typeof window !== 'undefined' && window.supabase) {
  console.log("✅ Supabase client tersedia");
} else {
  console.log("❌ Supabase client tidak tersedia");
}

// Test 2: Cek auth user
async function testAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    if (error) {
      console.log("❌ Auth error:", error);
    } else {
      console.log("✅ User data:", user);
    }
  } catch (e) {
    console.log("❌ Auth test failed:", e);
  }
}

// Test 3: Cek tabel magang
async function testTable() {
  try {
    const { data, error } = await window.supabase
      .from("magang")
      .select("*")
      .limit(1);
    
    if (error) {
      console.log("❌ Table error:", error);
    } else {
      console.log("✅ Table accessible, sample data:", data);
    }
  } catch (e) {
    console.log("❌ Table test failed:", e);
  }
}

// Jalankan test
testAuth();
testTable();
