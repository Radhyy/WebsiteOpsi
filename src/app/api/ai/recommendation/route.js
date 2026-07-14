import { NextResponse } from 'next/server';
import { groqAI } from '../../../../lib/groq';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, learningGaps, recentActivities, iotData } = body;

    const systemPrompt = `Anda adalah asisten AI pendidikan (Smart Learning). Tugas Anda adalah memberikan 3 rekomendasi langkah pembelajaran yang spesifik berdasarkan data siswa.
Nama Siswa: ${studentName || 'Siswa'}

Data Gap Pembelajaran (Kelemahan):
${JSON.stringify(learningGaps || [])}

Aktivitas Terakhir (Skor Latihan/Tugas):
${JSON.stringify(recentActivities || [])}

Data Sinyal IoT (Ketukan Meja: SUCCESS, STRUGGLE, HELP):
${JSON.stringify(iotData || [])}

Aturan:
1. Anda sedang berbicara kepada GURU (wali kelas), BUKAN kepada siswa. Berikan rekomendasi langkah aksi untuk GURU dalam membimbing siswa ini.
2. SANGAT PENTING: Jaga agar setiap langkah SANGAT PENDEK. Maksimal 1 kalimat singkat (10-12 kata). Jangan gunakan kalimat majemuk.
3. Analisis data: Jika nilai bagus dan IoT banyak SUCCESS, berikan guru saran pengayaan atau apresiasi. Jika kurang (banyak STRUGGLE/HELP), berikan ide intervensi spesifik.
4. Anda WAJIB merespons HANYA dengan format JSON yang valid persis seperti skema berikut ini (tanpa teks tambahan, markdown, atau penjelasan):
{
  "recommendations": [
    { "step": "Langkah 1", "text": "Isi rekomendasi pertama..." },
    { "step": "Langkah 2", "text": "Isi rekomendasi kedua..." },
    { "step": "Langkah 3", "text": "Isi rekomendasi ketiga..." }
  ]
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Berikan 3 rekomendasi dalam format JSON sekarang.' }
    ];

    // Gunakan Llama-3 8b untuk response JSON cepat
    const rawResponse = await groqAI.generateChat(messages, 'llama-3.1-8b-instant');
    
    // Parse JSON
    const parsedData = JSON.parse(rawResponse.replace(/```json/g, '').replace(/```/g, ''));

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendation: ' + error.message }, { status: 500 });
  }
}
