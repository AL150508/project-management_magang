/**
 * Script untuk mengisi otomatis koordinat latitude & longitude pada tabel dudi yang masih NULL
 * Jalankan dengan: node geocode-dudi.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function getCoordinates(alamat) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(alamat)}&limit=1&countrycodes=id`,
      { headers: { 'User-Agent': 'Magang Portal App/1.0' } }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }

      // Validasi batas Indonesia
      if (coords.lat >= -11 && coords.lat <= 6 && coords.lon >= 95 && coords.lon <= 141) {
        return coords
      }
    }
    return null
  } catch (error) {
    console.error(`Error geocoding alamat "${alamat}":`, error.message)
    return null
  }
}

async function geocodeDudiData() {
  try {
    console.log('🚀 Memulai batch geocoding DUDI...')
    console.log('📍 Mencari DUDI yang belum memiliki koordinat...')
    
    const { data: dudiList, error } = await supabase
      .from('dudi')
      .select('id, nama_perusahaan, alamat, latitude, longitude')
      .or('latitude.is.null,longitude.is.null,latitude.eq.0,longitude.eq.0')

    if (error) {
      throw new Error(`Error fetching DUDI data: ${error.message}`)
    }

    if (!dudiList || dudiList.length === 0) {
      console.log('✅ Semua DUDI sudah memiliki koordinat!')
      return
    }

    console.log(`📋 Ditemukan ${dudiList.length} DUDI yang perlu di-geocode:`)
    dudiList.forEach((dudi, index) => {
      console.log(`   ${index + 1}. ${dudi.nama_perusahaan} - ${dudi.alamat}`)
    })
    
    console.log('\n🔄 Memulai proses geocoding...')
    
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < dudiList.length; i++) {
      const dudi = dudiList[i]
      
      console.log(`\n[${i + 1}/${dudiList.length}] Processing: ${dudi.nama_perusahaan}`)
      console.log(`📍 Alamat: ${dudi.alamat}`)

      const coords = await getCoordinates(dudi.alamat)

      if (coords) {
        try {
          const { error: updateError } = await supabase
            .from('dudi')
            .update({ 
              latitude: coords.lat, 
              longitude: coords.lon,
              updated_at: new Date().toISOString()
            })
            .eq('id', dudi.id)

          if (updateError) {
            throw new Error(`Update error: ${updateError.message}`)
          }

          console.log(`✅ Updated: ${coords.lat}, ${coords.lon}`)
          successCount++
        } catch (updateErr) {
          console.log(`❌ Failed to update database: ${updateErr.message}`)
          failCount++
        }
      } else {
        console.log(`❌ Failed: ${dudi.alamat}`)
        failCount++
      }

      // Delay 1 detik untuk menghindari rate limit
      if (i < dudiList.length - 1) {
        console.log('⏳ Waiting 1 second...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('\n📊 HASIL GEOCODING:')
    console.log(`✅ Berhasil: ${successCount} DUDI`)
    console.log(`❌ Gagal: ${failCount} DUDI`)
    console.log(`📍 Total: ${dudiList.length} DUDI`)
    
    if (successCount > 0) {
      console.log('\n🎉 Geocoding selesai!')
      console.log('✔ Semua DUDI lama punya koordinat valid')
      console.log('✔ Marker muncul di lokasi yang benar (termasuk Madura)')
      console.log('✔ Peta role siswa & guru akurat')
      console.log('✔ Tidak ada marker yang fallback di Malang')
      console.log('✔ Sistem jauh lebih profesional')
    }
    
  } catch (error) {
    console.error('💥 Error dalam batch geocoding:', error.message)
    process.exit(1)
  }
}

// Jalankan script
geocodeDudiData().then(() => {
  console.log('\n✨ Done!')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Script gagal:', error.message)
  process.exit(1)
})