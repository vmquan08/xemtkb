async function getScheduleLink() {
    try {
        const response = await fetch("https://api.allorigins.win/raw?url=https://thptbencat.edu.vn/category/thoi-khoa-bieu");
        const data = await response.text();

        const parser = new DOMParser();
        const html = parser.parseFromString(data, 'text/html');
    
        const div = html.querySelector('.col-sm-9');

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
// cái này để xuất dữ liệu từ link google sheet ra
getScheduleLink().then(ggsheetLink => {
    if (ggsheetLink) {
        const ggsheetCSVLink = ggsheetLink.replace("edit?usp=sharing", "export?format=csv");

        const container = document.getElementById('schedule-container');
        container.innerHTML = 'Đang tải dữ liệu...';

        fetch(ggsheetCSVLink)
        .then(response => response.text())
        .then(data => { 
            scheduleData = data.split('\n').map(row => 
                row.split(',').map(cell => cell.trim().replace(/\r/g, '')));
        })
        .catch(error => {
            alert("Không thể trích xuất dữ liệu:", error);
        });


    } else alert("Không tìm thấy liên kết Google Sheets");
});

let classSchedule = [];
// tìm tên lớp nhập ở trong placeholder và lưu lại thời khóa biểu
function searchClass(){
    let className = document.getElementById('class-input').value.trim();
    if (!className) {
        alert("Vui lòng nhập tên lớp");
        return;
    }

    localStorage.setItem('lastClass', className);
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

// hiển thị thời khóa biểu
function displaySchedule() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';

    if (classSchedule.length == 0) {
        container.innerHTML = '<p>Không có thời khóa biểu</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table')

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

// load dữ liệu khi truy cập vào web (từ localstorage)
window.onload = async function () {
    let lastClass = localStorage.getItem("lastClass");
    
    if (lastClass) {
        document.getElementById('class-input').value = lastClass;

        let ggsheetLink = await getScheduleLink();
        if (ggsheetLink) {
            const ggsheetCSVLink = ggsheetLink.replace("edit?usp=sharing", "export?format=csv");

            fetch(ggsheetCSVLink)
                .then(response => response.text())
                .then(data => {
                    scheduleData = data.split('\n').map(row =>
                        row.split(',').map(cell => cell.trim().replace(/\r/g, ''))
                    );

                    setTimeout(() => {
                        searchClass();
                    }, 1000);
                })
                .catch(error => {
                    alert("Không thể trích xuất dữ liệu:", error);
                });
        } else {
            alert("Không tìm thấy liên kết Google Sheets");
        }
    }
};
