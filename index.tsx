import { GoogleGenAI, Type } from "@google/genai";

// --- TYPE DEFINITIONS ---
interface ReportData {
  studentName: string;
  moduleTopic: string;
  trainingDuration: string;
  projectLink: string;
  referralLink: string;
  moduleLink: string;
  // Tutor's Feedback sections
  attendance: string;
  engagement: string;
  taskCompletion: string;
  // New sections
  moduleSummary: string;
  skillsGained: string; // Stored as a newline-separated string
  tutorName: string;
  pathwayImage: string;
}

// --- INITIAL STATE ---
const reportData: ReportData = {
  studentName: "Abqari Muhammad",
  moduleTopic: "Matematika Junior",
  trainingDuration: "Bulan ke-1",
  projectLink: "#",
  referralLink: "#",
  moduleLink: "#",
  attendance: "Abqari Muhammad selalu hadir di setiap sesi pelajaran dan menunjukkan antusiasme yang tinggi. Kami sangat menghargai kehadirannya yang konsisten, ini adalah langkah penting dalam proses belajarnya. Terus semangat, ya!",
  engagement: "Abqari Muhammad sangat terlibat dalam setiap sesi, aktif berpartisipasi dalam diskusi, dan tidak ragu mengajukan pertanyaan yang mendalam. Abqari Muhammad selalu menunjukkan kemajuan yang baik dan memahami materi dengan cepat. Saya sering memberikan tantangan tambahan untuk membantu Abqari Muhammad terus berkembang dan belajar lebih jauh.",
  taskCompletion: "Abqari Muhammad telah berhasil menyelesaikan semua tugas dengan sangat baik. Pemahamannya terhadap materi sangat jelas, dan Abqari Muhammad mampu menyelesaikan setiap tugas tepat waktu. Senang sekali melihat kemajuannya yang terus meningkat. Terus lanjutkan usaha ini, ya!",
  moduleSummary: "Siswa mampu menghitung dalam urutan maju dan mundur dengan akurat, mengembangkan keterampilan dalam mengenali pola angka serta memahami hubungan antara bilangan. Mereka juga berhasil mengidentifikasi dan mengklasifikasikan berbagai bentuk geometris berdasarkan sifat dan karakteristiknya. Selain itu, siswa menguasai konsep urutan naik dan turun, menerapkannya dalam pemecahan masalah matematika sehari-hari. Akhirnya, siswa menyelesaikan tantangan labirin dengan strategi yang logis dan sistematis, menunjukkan pemahaman tentang pola, jalur optimal, dan pemecahan masalah.",
  skillsGained: `- Siswa mengembangkan kemampuan berhitung dalam urutan maju dan mundur, meningkatkan pemahaman tentang angka dan pola bilangan.\n- Siswa belajar mengenali, membandingkan, dan mengklasifikasikan bentuk-bentuk geometris berdasarkan sifat dan karakteristiknya.\n- Siswa menguasai konsep pengurutan angka dalam urutan naik dan turun, serta menerapkannya dalam berbagai latihan logika.\n- Siswa melatih pemikiran strategis dan logis dengan menyelesaikan tantangan labirin menggunakan pola pergerakan yang efisien.`,
  tutorName: "Riki Dian Pratama",
  pathwayImage: "https://i.ibb.co/SNy2hW5/jalur-pendidikan.png",
};

// --- DOM ELEMENT REFERENCES ---
const formContainer = document.getElementById('report-form') as HTMLFormElement;
const reportContainer = document.getElementById('report-container') as HTMLDivElement;
const exportPdfButton = document.getElementById('export-pdf') as HTMLButtonElement;
const viewEditorBtn = document.getElementById('view-editor-btn') as HTMLButtonElement;
const viewPreviewBtn = document.getElementById('view-preview-btn') as HTMLButtonElement;
const formPanel = document.getElementById('form-container') as HTMLDivElement;


// --- TEMPLATES & DATA for FORM ---
const assessmentOptions = {
    attendance: [
        { value: "STUDENT_NAME selalu hadir di setiap sesi pelajaran dan menunjukkan antusiasme yang tinggi. Kami sangat menghargai kehadirannya yang konsisten, ini adalah langkah penting dalam proses belajarnya. Terus semangat, ya!", checked: true },
        { value: "STUDENT_NAME mengikuti 3 dari 4 sesi pelajaran bulan ini. Kehadirannya cukup baik, dan meskipun ada satu sesi yang terlewat, STUDENT_NAME tetap mengikuti materi dengan baik. Kami yakin kehadiran yang lebih konsisten akan membuat belajarnya lebih maksimal!", checked: false },
        { value: "STUDENT_NAME hanya hadir di 2 dari 4 sesi bulan ini. Kami melihat kehadiran yang tidak konsisten mulai mempengaruhi kemajuan belajar. Akan lebih baik jika STUDENT_NAME bisa hadir lebih teratur agar tidak tertinggal materi.", checked: false },
        { value: "STUDENT_NAME hadir hanya di 1 dari 4 sesi pelajaran bulan ini. Kami khawatir ini bisa mempengaruhi pemahaman materi yang diajarkan. Jika memungkinkan, mari kita diskusikan bagaimana agar STUDENT_NAME bisa lebih rutin mengikuti pelajaran.", checked: false },
        { value: "STUDENT_NAME tidak hadir di seluruh sesi pelajaran bulan ini. Kami ingin membantu agar STUDENT_NAME bisa kembali mengikuti pelajaran dengan lebih baik. Kami akan menghubungi Anda untuk membahas solusi yang tepat.", checked: false },
    ],
    engagement: [
        { value: "STUDENT_NAME sangat terlibat dalam setiap sesi, aktif berpartisipasi dalam diskusi, dan tidak ragu mengajukan pertanyaan yang mendalam. STUDENT_NAME selalu menunjukkan kemajuan yang baik dan memahami materi dengan cepat. Saya sering memberikan tantangan tambahan untuk membantu STUDENT_NAME terus berkembang dan belajar lebih jauh.", checked: true },
        { value: "STUDENT_NAME cukup fokus di kelas meskipun jarang bertanya. Namun, STUDENT_NAME selalu memperhatikan dengan baik dan mengikuti instruksi dengan seksama. Mungkin dengan lebih banyak berpartisipasi dalam diskusi, STUDENT_NAME bisa meningkatkan pemahaman materi. Secara keseluruhan, STUDENT_NAME sudah menunjukkan perkembangan yang positif.", checked: false },
        { value: "STUDENT_NAME cenderung lebih diam di kelas dan jarang terlibat dalam diskusi. Kami menyarankan agar STUDENT_NAME lebih terbuka untuk bertanya atau berinteraksi sehingga bisa lebih mudah memahami materi. Jika ada kendala tertentu, kami siap membantu agar suasana kelas lebih nyaman untuk belajar.", checked: false },
        { value: "STUDENT_NAME tampak mengalami kesulitan dalam mengikuti pelajaran terakhir. Kurangnya fokus menyebabkan STUDENT_NAME tidak sepenuhnya menangkap materi. Kami menyarankan agar STUDENT_NAME lebih terlibat aktif dalam kelas agar pemahaman terhadap pelajaran meningkat. Jika Anda memerlukan bantuan atau rekaman kelas, kami siap memberikan dukungan tambahan.", checked: false },
    ],
    taskCompletion: [
        { value: "STUDENT_NAME telah berhasil menyelesaikan semua tugas dengan sangat baik. Pemahamannya terhadap materi sangat jelas, dan STUDENT_NAME mampu menyelesaikan setiap tugas tepat waktu. Senang sekali melihat kemajuannya yang terus meningkat. Terus lanjutkan usaha ini, ya!", checked: true },
        { value: "STUDENT_NAME berhasil menyelesaikan sebagian besar tugas dengan baik, namun ada beberapa area yang memerlukan sedikit perbaikan. Dengan latihan tambahan dan perhatian lebih, STUDENT_NAME pasti akan bisa meningkatkan kualitas tugas-tugasnya dan mencapai hasil yang lebih baik lagi.", checked: false },
        { value: "STUDENT_NAME tampaknya menghadapi beberapa tantangan dalam menyelesaikan tugas kali ini. Sangat penting bagi STUDENT_NAME untuk meluangkan lebih banyak waktu dalam berlatih agar pemahamannya terhadap materi semakin kuat. Kami berharap STUDENT_NAME bisa mengejar ketinggalan. Jika ada kesulitan, jangan ragu untuk menghubungi saya, saya siap membantu.", checked: false },
    ]
};


// --- RENDER FUNCTIONS ---

/**
 * Renders the entire form into the form container.
 */
function renderForm() {

    const createRadioGroup = (name: keyof typeof assessmentOptions, title: string) => {
        const optionsHtml = assessmentOptions[name].map((opt, index) => {
            const id = `${name}-${index}`;
            const isChecked = opt.value.replace(/STUDENT_NAME/g, reportData.studentName) === reportData[name];
            return `
                <div class="radio-option">
                    <input type="radio" id="${id}" name="${name}" value="${opt.value}" ${isChecked ? 'checked' : ''}>
                    <label for="${id}" data-template="${opt.value}">${opt.value.replace(/STUDENT_NAME/g, reportData.studentName)}</label>
                </div>
            `;
        }).join('');

        return `<h4>${title}</h4>${optionsHtml}`;
    };

    formContainer.innerHTML = `
        <fieldset>
            <legend>Informasi Siswa & Laporan</legend>
            <label for="studentName">Nama Siswa</label>
            <input type="text" id="studentName" name="studentName" value="${reportData.studentName}">
            <label for="moduleTopic">Kursus</label>
            <input type="text" id="moduleTopic" name="moduleTopic" value="${reportData.moduleTopic}">
            <label for="trainingDuration">Lama Pelatihan</label>
            <input type="text" id="trainingDuration" name="trainingDuration" value="${reportData.trainingDuration}">
            <label for="tutorName">Laporan dibuat oleh</label>
            <input type="text" id="tutorName" name="tutorName" value="${reportData.tutorName}">
        </fieldset>

        <fieldset>
            <legend>Detail Modul</legend>
            <label for="moduleSummary">Hasil (Deskripsi Modul)</label>
            <textarea id="moduleSummary" name="moduleSummary" rows="8">${reportData.moduleSummary}</textarea>
            <label for="skillsGained">Keahlian yang Didapatkan (satu per baris)</label>
            <textarea id="skillsGained" name="skillsGained" rows="6">${reportData.skillsGained}</textarea>
        </fieldset>
        
        <fieldset>
            <legend>Tutor's Feedback (Assessment)</legend>
            <p>Pilih opsi untuk mengisi feedback tutor dan menghitung skor.</p>
            ${createRadioGroup('attendance', 'Kehadiran (Attendance)')}
            ${createRadioGroup('engagement', 'Keterlibatan & kesulitan (Engagement & Difficulty)')}
            ${createRadioGroup('taskCompletion', 'Penyelesaian Tugas (Task Completion)')}
        </fieldset>

        <fieldset>
            <legend>Links & Assets</legend>
            <label for="projectLink">Project Link</label>
            <input type="text" id="projectLink" name="projectLink" value="${reportData.projectLink}">
            <label for="referralLink">Referral Link (for Free Lesson)</label>
            <input type="text" id="referralLink" name="referralLink" value="${reportData.referralLink}">
            <label for="moduleLink">Module Link (Footer)</label>
            <input type="text" id="moduleLink" name="moduleLink" value="${reportData.moduleLink}">
            <label for="pathwayImage">Gambar Jalur Pendidikan</label>
            <input type="file" id="pathwayImage" name="pathwayImage" accept="image/*" class="file-input-hidden">
            <label for="pathwayImage" class="file-input-label">Import Gambar</label>
        </fieldset>
    `;
}

/**
 * Calculates a star rating based on assessment selections.
 * @returns A number from 1 to 5.
 */
function calculateStarRating(): number {
    let score = 0;
    const categories: (keyof typeof assessmentOptions)[] = ['attendance', 'engagement', 'taskCompletion'];
    categories.forEach(category => {
        const selectedValue = reportData[category];
        const selectedOptionIndex = assessmentOptions[category].findIndex(opt => {
            return opt.value.replace(/STUDENT_NAME/g, reportData.studentName) === selectedValue;
        });

        if (selectedOptionIndex !== -1) {
            switch(category) {
                case 'attendance':
                    if (selectedOptionIndex === 0) score += 3;
                    else if (selectedOptionIndex === 1) score += 2;
                    else score += 1;
                    break;
                case 'engagement':
                     if (selectedOptionIndex === 0) score += 3;
                    else if (selectedOptionIndex === 1) score += 2;
                    else score += 1;
                    break;
                case 'taskCompletion':
                    if (selectedOptionIndex === 0) score += 4;
                    else if (selectedOptionIndex === 1) score += 2;
                    else score += 1;
                    break;
            }
        }
    });

    if (score >= 9) return 5;
    if (score >= 7) return 4;
    if (score >= 5) return 3;
    if (score >= 4) return 2;
    return 1;
}


/**
 * Renders the entire report preview into the report container.
 */
function renderReport() {
    const data = reportData;
    const skillsList = data.skillsGained.split('\n').map(skill => `<li>${skill.trim()}</li>`).join('');
    const starRating = calculateStarRating();
    const starsHtml = Array.from({ length: 5 }, (_, i) => `
        <svg class="star-icon ${i < starRating ? 'filled' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    `).join('');

    reportContainer.innerHTML = `
        <div class="report-header">
            <div class="logo-text">Algonova <span class="logo-subtext">by Algorithmics</span></div>
            <h1 class="report-title">Student's Report</h1>
        </div>
        <div class="report-body">
            <div class="report-grid">
                <div class="report-card info-card">
                    <h3>Informasi Siswa</h3>
                    <div class="info-item">
                        <span class="info-label">Nama:</span>
                        <span class="info-value">${data.studentName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Kursus:</span>
                        <span class="info-value">${data.moduleTopic}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Lama Pelatihan:</span>
                        <span class="info-value">${data.trainingDuration}</span>
                    </div>
                </div>
                <div class="report-card score-card">
                    <h3>Skor Total</h3>
                    <h2>Algo Math</h2>
                    <div class="star-rating">${starsHtml}</div>
                </div>
                <div class="report-card project-card">
                    <h4><span class="card-icon">💻</span> Proyek hasil Student</h4>
                    <div class="card-content">
                        <p>Proyek akhir diakses melalui link dibawah ini:</p>
                        <a href="${data.projectLink}">🔗 Proyek Akhir Bulan Ini</a>
                    </div>
                </div>
                <div class="report-card lesson-card">
                     <h4><span class="card-icon">🎁</span> Free Lesson</h4>
                     <div class="card-content">
                        <p>🙋 Mau dapatkan free lesson?</p>
                        <a href="${data.referralLink}">👉 Bagikan link ini dan dapatkan reward class gratis!</a>
                    </div>
                </div>
            </div>
            <div class="report-grid large-grid">
                <div class="large-card">
                    <h4><span class="card-icon">📖</span> Tentang Modul Ini</h4>
                    <div class="large-card-content">
                        <div class="module-item">
                            <span class="module-label">Topik Modul</span>
                            <span class="info-value-static">${data.moduleTopic}</span>
                        </div>
                        <div class="module-item">
                            <span class="module-label">Hasil:</span>
                        </div>
                        <p class="module-summary">${data.moduleSummary}</p>
                    </div>
                </div>
                <div class="large-card">
                    <h4><span class="card-icon">✅</span> Keahlian yang Didapatkan</h4>
                    <div class="large-card-content">
                        <ul class="skills-list">${skillsList}</ul>
                    </div>
                </div>
            </div>
             <div class="report-grid-single-col">
                 <div class="large-card">
                    <h4><span class="card-icon">📝</span> Tutor's Feedback</h4>
                     <div class="large-card-content feedback-content">
                        <p>${data.attendance}</p>
                        <p>${data.engagement}</p>
                        <p>${data.taskCompletion}</p>
                     </div>
                 </div>
                 <div class="large-card pathway">
                    <h4><span class="card-icon">🗺️</span> Jalur pendidikan</h4>
                    <div class="large-card-content">
                        <img src="${data.pathwayImage}" alt="Jalur Pendidikan Algorithmics">
                    </div>
                 </div>
             </div>
        </div>
        <div class="report-footer">
             <a href="${data.moduleLink}" class="footer-link">👉 Lihat Modul Lengkap</a>
            <span class="footer-credit">Laporan dibuat oleh: ${data.tutorName}</span>
        </div>
    `;
}

/**
 * Binds event listeners to the form elements.
 */
function addEventListeners() {
    formContainer.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const name = target.name as keyof ReportData;
        
        if (name in reportData) {
            (reportData as any)[name] = target.value;
            if (name === 'studentName') {
                // Find checked radios and update their state from the template value
                document.querySelectorAll<HTMLInputElement>('input[type=radio]:checked').forEach(radio => {
                    const radioName = radio.name as keyof ReportData;
                    if(radioName in assessmentOptions) {
                        reportData[radioName] = radio.value.replace(/STUDENT_NAME/g, target.value);
                    }
                });
                render(); // Full re-render needed to update radio labels
            } else {
                renderReport(); // For other fields, just update the preview
            }
        }
    });

    formContainer.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const name = target.name as keyof ReportData;

        // Handle radio button selection
        if (target.type === 'radio' && name in assessmentOptions) {
            reportData[name] = target.value.replace(/STUDENT_NAME/g, reportData.studentName);
            renderReport();
        }

        // Handle file input
        if (target.id === 'pathwayImage' && target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                reportData.pathwayImage = reader.result as string;
                renderReport();
            };
            reader.readAsDataURL(target.files[0]);
        }
    });

    exportPdfButton.addEventListener('click', () => {
        window.print();
    });

    viewEditorBtn.addEventListener('click', () => {
        viewEditorBtn.classList.add('active');
        viewPreviewBtn.classList.remove('active');
        formPanel.classList.remove('view-hidden');
        reportContainer.classList.add('view-hidden');
    });

    viewPreviewBtn.addEventListener('click', () => {
        viewPreviewBtn.classList.add('active');
        viewEditorBtn.classList.remove('active');
        formPanel.classList.add('view-hidden');
        reportContainer.classList.remove('view-hidden');
    });
}

/**
 * Renders both the form and the report.
 */
function render() {
    renderForm();
    renderReport();
}

// --- INITIALIZATION ---
render();
addEventListeners();