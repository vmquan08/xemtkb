async function getScheduleLink() {
    try {
        const response = await fetch("https://api.allorigins.win/raw?url=https://thptbencat.edu.vn/category/thoi-khoa-bieu");
        const data = await response.text();

        const parser = new DOMParser();
        const html = parser.parseFromString(data, 'text/html');
    
        const div = html.querySelector('.col-sm-9');

        console.log(localStorage.getItem('lastClass'))

        if (div) {
            const ggsheetLink = div.querySelector('a[href*="https://docs.google.com/spreadsheets/d/"]')?.href;
            return ggsheetLink;
        } else return null;  
    } catch (error) {
        alert("Lỗi:", error);
        return null;
    }
}

let scheduleData = [];

// Cái này để xuất dữ liệu từ link Google Sheets ra
async function loadData() {
    const ggsheetLink = await getScheduleLink();
    if (ggsheetLink) {
        const ggsheetCSVLink = ggsheetLink.replace("edit?usp=sharing", "export?format=csv");

        const container = document.getElementById('schedule-container');
        container.innerHTML = 'Đang tải dữ liệu...';

        try {
            const response = await fetch(ggsheetCSVLink);
            const data = await response.text();

            scheduleData = data.split('\n').map(row =>
                row.split(',').map(cell => cell.trim().replace(/\r/g, ''))
            );

            console.log("Dữ liệu đã tải:", scheduleData);
            container.innerHTML = '';
        } catch (error) {
            alert("Không thể trích xuất dữ liệu:", error);
        }
    } else {
        alert("Không tìm thấy liên kết Google Sheets");
    }
}

// Tìm tên lớp nhập trong placeholder và lưu lại thời khóa biểu
function searchClass() {
    let className = document.getElementById('class-input').value.trim().toUpperCase();
    localStorage.setItem('lastClass', className);
    if (!className) {
        alert("Vui lòng nhập tên lớp");
        return;
    }

    const newUrl = window.location.origin + window.location.pathname + `?class=${encodeURIComponent(className)}`;
    window.history.pushState({}, '', newUrl);

    classSchedule = [];
    let found = false;

    for (let i = 0; i < scheduleData.length; i++) {
        if (scheduleData[i].some(cell => cell.trim() == className)) {
            found = true;

            for (let j = 0; j < 17 && (i + j) < scheduleData.length; j++) {
                classSchedule.push(scheduleData[i + j]);
            }
            break;
        }
    }

    if (!found) {
        alert("Không tìm thấy lớp này");
    } else {
        displaySchedule();
    }
}

// Hiển thị thời khóa biểu
function displaySchedule() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';

    if (classSchedule.length == 0) {
        container.innerHTML = '<p>Không có thời khóa biểu</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table');

    classSchedule.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach((cell, cellIndex) => {
            const cellElement = rowIndex === 0 ? document.createElement('th') : document.createElement('td');   
            cellElement.textContent = cell;
            tr.appendChild(cellElement);
        });
        table.appendChild(tr);
    });
    container.appendChild(table);
}

// Load dữ liệu khi truy cập vào web
window.onload = async function () {
    await loadData();

    const urlParameters = new URLSearchParams(window.location.search);
    let lastClass = urlParameters.get('class'); 

    if (lastClass) {
        document.getElementById('class-input').value = lastClass;
        searchClass();
    }
};
