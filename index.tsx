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

// --- UTILITY FUNCTIONS ---

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * @param str The string to escape.
 * @returns The escaped string.
 */
function escapeHTML(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Sanitizes a URL to ensure it uses a safe protocol.
 * @param url The URL to sanitize.
 * @returns A safe URL or '#' as a fallback.
 */
function sanitizeURL(url: string): string {
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('#')) {
        return trimmedUrl;
    }
    return '#';
}


// --- INITIAL STATE ---
const reportData: ReportData = {
  studentName: "Abqari Muhammad",
  moduleTopic: "Matematika Junior",
  trainingDuration: "Bulan ke-1",
  projectLink: "#",
  referralLink: "https://algonova.id/invite?utm_source=refferal&utm_medium=employee&utm_campaign=social_network&utm_content=atama520",
  moduleLink: "https://drive.google.com/drive/u/0/folders/1lErW_RKjHOkAgqCr9yymELg3yUZzvBEb",
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
// New elements for the guide modal
const generatePdfGuideBtn = document.getElementById('generate-pdf-guide-btn') as HTMLButtonElement;
const pdfGuideModal = document.getElementById('pdf-guide-modal') as HTMLDivElement;
const closeModalBtn = document.getElementById('close-modal-btn') as HTMLButtonElement;
const modalBody = document.getElementById('modal-body') as HTMLDivElement;


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
    const safeStudentNameForLabel = escapeHTML(reportData.studentName);

    const createRadioGroup = (name: keyof typeof assessmentOptions, title: string) => {
        const optionsHtml = assessmentOptions[name].map((opt, index) => {
            const id = `${name}-${index}`;
            // Comparison logic uses raw data
            const isChecked = opt.value.replace(/STUDENT_NAME/g, reportData.studentName) === reportData[name];
            // Text for rendering is escaped to prevent XSS
            const labelText = opt.value.replace(/STUDENT_NAME/g, safeStudentNameForLabel);
            return `
                <div class="radio-option">
                    <input type="radio" id="${id}" name="${name}" value="${opt.value}" ${isChecked ? 'checked' : ''}>
                    <label for="${id}" data-template="${opt.value}">${labelText}</label>
                </div>
            `;
        }).join('');

        return `<h4>${title}</h4>${optionsHtml}`;
    };

    formContainer.innerHTML = `
        <fieldset>
            <legend>Informasi Siswa & Laporan</legend>
            <label for="studentName">Nama Siswa</label>
            <input type="text" id="studentName" name="studentName" value="${escapeHTML(reportData.studentName)}">
            <label for="moduleTopic">Kursus</label>
            <input type="text" id="moduleTopic" name="moduleTopic" value="${escapeHTML(reportData.moduleTopic)}">
            <label for="trainingDuration">Lama Pelatihan</label>
            <input type="text" id="trainingDuration" name="trainingDuration" value="${escapeHTML(reportData.trainingDuration)}">
            <label for="tutorName">Laporan dibuat oleh</label>
            <input type="text" id="tutorName" name="tutorName" value="${escapeHTML(reportData.tutorName)}">
        </fieldset>

        <fieldset>
            <legend>Detail Modul</legend>
            <label for="moduleSummary">Hasil (Deskripsi Modul)</label>
            <textarea id="moduleSummary" name="moduleSummary" rows="8">${escapeHTML(reportData.moduleSummary)}</textarea>
            <label for="skillsGained">Keahlian yang Didapatkan (satu per baris)</label>
            <textarea id="skillsGained" name="skillsGained" rows="6">${escapeHTML(reportData.skillsGained)}</textarea>
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
            <input type="text" id="projectLink" name="projectLink" value="${escapeHTML(reportData.projectLink)}">
            <label for="referralLink">Referral Link (for Free Lesson)</label>
            <input type="text" id="referralLink" name="referralLink" value="${escapeHTML(reportData.referralLink)}">
            <label for="moduleLink">Module Link (Footer)</label>
            <input type="text" id="moduleLink" name="moduleLink" value="${escapeHTML(reportData.moduleLink)}">
            <label for="pathwayImage">Gambar Jalur Pendidikan</label>
            <input type="file" id="pathwayImage" name="pathwayImage" accept="image/*" class="file-input-hidden">
            <label for="pathwayImage" class="file-input-label">Import Gambar</label>
        </fieldset>
    `;
}

/**
 * Calculates a star rating based on assessment selections.
 * This version uses a weighted scoring system for more nuance.
 * @returns A number from 1 to 5.
 */
function calculateStarRating(): number {
    // Define points for each option based on its index (0 is best).
    // The scores range from 5 (excellent) to 1 (needs improvement).
    const categoryScores = {
        attendance: [5, 4, 3, 2, 1], // 5 options
        engagement: [5, 4, 2, 1],     // 4 options
        taskCompletion: [5, 3, 1]      // 3 options
    };

    // Define weights for each category to emphasize their relative importance.
    // The sum of weights should be 1.0.
    const categoryWeights = {
        attendance: 0.20,
        engagement: 0.30,
        taskCompletion: 0.50,
    };

    let totalWeightedScore = 0;
    const categories: (keyof typeof assessmentOptions)[] = ['attendance', 'engagement', 'taskCompletion'];

    categories.forEach(category => {
        const selectedValue = reportData[category];
        const selectedOptionIndex = assessmentOptions[category].findIndex(opt => {
            return opt.value.replace(/STUDENT_NAME/g, reportData.studentName) === selectedValue;
        });

        if (selectedOptionIndex !== -1) {
            // Get the score for the selected option, defaulting to 0 if not found.
            const score = categoryScores[category][selectedOptionIndex] || 0;
            const weight = categoryWeights[category];
            totalWeightedScore += score * weight;
        }
    });

    // The total weighted score will be between 1 and 5.
    // We round it to the nearest whole number to determine the star rating.
    // We also clamp the value between 1 and 5 as a safeguard.
    const finalRating = Math.round(Math.max(1, Math.min(5, totalWeightedScore)));

    return finalRating;
}


/**
 * Renders the entire report preview into the report container.
 */
function renderReport() {
    const data = reportData;

    // --- Sanitize and format data for safe rendering ---
    const safeStudentName = escapeHTML(data.studentName);
    const safeModuleTopic = escapeHTML(data.moduleTopic);
    const safeTrainingDuration = escapeHTML(data.trainingDuration);
    const safeTutorName = escapeHTML(data.tutorName);
    const formattedModuleSummary = escapeHTML(data.moduleSummary).replace(/\n/g, '<br>');
    const safeAttendance = escapeHTML(data.attendance);
    const safeEngagement = escapeHTML(data.engagement);
    const safeTaskCompletion = escapeHTML(data.taskCompletion);
    const safeProjectLink = escapeHTML(sanitizeURL(data.projectLink));
    const safeReferralLink = escapeHTML(sanitizeURL(data.referralLink));
    const safeModuleLink = escapeHTML(sanitizeURL(data.moduleLink));

    const skillsList = data.skillsGained.split('\n')
        .map(skill => skill.trim())
        .filter(skill => skill) // BUG FIX: Filter out empty lines
        .map(skill => `<li>${escapeHTML(skill)}</li>`).join('');

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
                        <span class="info-value">${safeStudentName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Kursus:</span>
                        <span class="info-value">${safeModuleTopic}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Lama Pelatihan:</span>
                        <span class="info-value">${safeTrainingDuration}</span>
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
                        <a href="${safeProjectLink}">🔗 Proyek Akhir Bulan Ini</a>
                    </div>
                </div>
                <div class="report-card lesson-card">
                     <h4><span class="card-icon">🎁</span> Free Lesson</h4>
                     <div class="card-content">
                        <p>🙋 Mau dapatkan free lesson?</p>
                        <a href="${safeReferralLink}">👉 Bagikan link ini dan dapatkan reward class gratis!</a>
                    </div>
                </div>
            </div>
            <div class="report-grid large-grid">
                <div class="large-card">
                    <h4><span class="card-icon">📖</span> Tentang Modul Ini</h4>
                    <div class="large-card-content">
                        <div class="module-item">
                            <span class="module-label">Topik Modul</span>
                            <span class="info-value-static">${safeModuleTopic}</span>
                        </div>
                        <div class="module-item">
                            <span class="module-label">Hasil:</span>
                        </div>
                        <p class="module-summary">${formattedModuleSummary}</p>
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
                        <p>${safeAttendance}</p>
                        <p>${safeEngagement}</p>
                        <p>${safeTaskCompletion}</p>
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
             <a href="${safeModuleLink}" class="footer-link">👉 Lihat Modul Lengkap</a>
            <span class="footer-credit">Laporan dibuat oleh: ${safeTutorName}</span>
        </div>
    `;
}

/**
 * Uses Gemini to generate instructions for saving a PDF and displays them in a modal.
 */
async function generatePdfInstructions() {
    modalBody.innerHTML = '<p>Generating instructions with AI...</p>';
    pdfGuideModal.classList.remove('view-hidden');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Please provide simple, friendly, and concise instructions for a user on how to save a student report for '${reportData.studentName}' as a PDF from their browser.
        
        Explain these three steps clearly in Indonesian:
        1. Click the 'Save as PDF' button in the top header.
        2. When the print preview window opens, find the 'Destination' or 'Printer' dropdown.
        3. Select 'Save as PDF' from the list instead of a physical printer, and then click the 'Save' button.
        
        Keep the tone helpful and encouraging.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        modalBody.innerHTML = escapeHTML(response.text).replace(/\n/g, '<br>');

    } catch (error) {
        console.error("Error generating PDF instructions:", error);
        modalBody.innerHTML = '<p>Sorry, we couldn\'t generate instructions at the moment. Please try again later.</p><p><b>Standard Instructions:</b><br>1. Click "Save as PDF".<br>2. In the print dialog, change the destination printer to "Save as PDF".<br>3. Click "Save".</p>';
    }
}


/**
 * Binds event listeners to the form elements.
 */
function addEventListeners() {
    formContainer.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
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
                render(); // Full re-render needed to update radio labels and values
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

    // --- Listeners for the new modal ---
    generatePdfGuideBtn.addEventListener('click', generatePdfInstructions);

    closeModalBtn.addEventListener('click', () => {
        pdfGuideModal.classList.add('view-hidden');
    });

    pdfGuideModal.addEventListener('click', (e) => {
        if (e.target === pdfGuideModal) {
            pdfGuideModal.classList.add('view-hidden');
        }
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