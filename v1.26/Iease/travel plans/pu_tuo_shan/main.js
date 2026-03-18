// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 時間軸動畫
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'all 0.6s ease-out';
    observer.observe(item);
});

// 預算計算器
function calculateBudget() {
    const budgetItems = document.querySelectorAll('.budget-table tr');
    let total = 0;
    
    budgetItems.forEach(row => {
        if (!row.classList.contains('total')) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const amount = parseFloat(cells[2].textContent.replace('元', ''));
                if (!isNaN(amount)) {
                    total += amount;
                }
            }
        }
    });
    
    console.log('總預算:', total);
}

// 複製行程到剪貼板
function copyItinerary() {
    const itinerary = document.querySelector('.main').innerText;
    navigator.clipboard.writeText(itinerary).then(() => {
        alert('行程已複製到剪貼板！');
    });
}

// 下載為 PDF (需要 html2pdf.js 庫)
function downloadPDF() {
    if (typeof html2pdf !== 'undefined') {
        const element = document.querySelector('.main');
        const opt = {
            margin: 10,
            filename: 'putuoshan-itinerary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    } else {
        alert('請先引入 html2pdf.js 庫');
    }
}

// 當前日期顯示
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    console.log('當前日期:', now.toLocaleDateString('zh-HK', options));
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('普陀山行程頁面已加載');
    displayCurrentDate();
    
    // 添加複製按鈕
    const header = document.querySelector('.header');
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 複製行程';
    copyBtn.style.cssText = `
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        margin-top: 20px;
        font-size: 1rem;
    `;
    copyBtn.onclick = copyItinerary;
    header.querySelector('.container').appendChild(copyBtn);
});

// 導航高亮
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${current}` ? '#764ba2' : '#667eea';
    });
});
