/**
 * Ini adalah endpoint Backend Serverless (Node.js) yang berjalan di Netlify.
 * URL akses: /api/fuzzy (karena kita redirect di netlify.toml)
 */

exports.handler = async (event, context) => {
  // Hanya menerima HTTP POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    // Menangkap data dari React (Frontend)
    const { gerakanGelisah, waktuJeda } = JSON.parse(event.body);

    /**
     * DI SINI NANTINYA LOGIKA FUZZY MAMDANI AKAN DITULIS.
     * Untuk sekarang, kita buat simulasi logika statis sebagai contoh.
     */
    
    let status = 'Berhasil';
    let rekomendasi = 'Pertahankan metode belajar ini.';
    let persentase = 88;

    // Simulasi Rule 1: IF gerakanGelisah == TINGGI AND waktuJeda == LAMA THEN Kesulitan
    if (gerakanGelisah > 70 && waktuJeda > 60) {
      status = 'Kesulitan';
      rekomendasi = 'Gunakan manipulatif visual (blok pecahan) untuk menjelaskan konsep.';
      persentase = 42;
    } 
    // Simulasi Rule 2: IF sedang
    else if (gerakanGelisah > 40 || waktuJeda > 30) {
      status = 'Butuh Bantuan';
      rekomendasi = 'Berikan soal latihan pendukung untuk memantapkan konsep dasar.';
      persentase = 65;
    }

    // Mengembalikan hasil ke Frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: {
          status,
          persentase,
          rekomendasi
        }
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Terjadi kesalahan pada server.' }),
    };
  }
};
