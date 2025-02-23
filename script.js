async function getScheduleLink() {
    try {
        const baseUrl = "https://quan08corsproxy.quan20080108.workers.dev/https://thptbencat.edu.vn";
        
        const response = await fetch(baseUrl + "/category/thoi-khoa-bieu");
        const data = await response.text();

        const parser = new DOMParser();
        const html = parser.parseFromString(data, 'text/html');
        const div = html.querySelector('.col-sm-9');
        if (div) {
            const scheduleLink = div.querySelector('a')?.getAttribute('href');
            console.log(scheduleLink);
            if (scheduleLink) {
                const scheduleResponse = await fetch(baseUrl + scheduleLink);
                const scheduleData = await scheduleResponse.text();
                
                const schedulePage = parser.parseFromString(scheduleData, 'text/html');
                const ggsheetLink = schedulePage.querySelector('a[href*="https://docs.google.com/spreadsheets/d/"]')?.href;
                
                return ggsheetLink;
            }
        }
        return null;
    } catch (error) {
        console.error("Lỗi:", error);
        return null;
    }
}

let scheduleData = [];

// Cái này để xuất dữ liệu từ link Google Sheets ra
async function loadData() {
    const ggsheetLink = await getScheduleLink();
    if (ggsheetLink) {
        const ggsheetCSVLink = ggsheetLink.replace("edit?usp=sharing", "gviz/tq?tqx=out:csv&sheet=TKBLop");
   
        const container = document.getElementById('schedule-container');
        container.innerHTML = 'Đang tải dữ liệu...';
        
        lastClass = localStorage.getItem('lastClass');
        if (lastClass) {
            document.getElementById('class-input').value = lastClass;
        }

        try {
            const response = await fetch(ggsheetCSVLink);
            const data = await response.text();

            scheduleData = data.split('\n').map(row =>
                row.split(',').map(cell => 
                    cell.trim()
                        .replace(/\r/g, '')
                        .replace(/^"/, '')  
                        .replace(/"$/, '')  
                )
            );
            container.innerHTML = '';
       
            console.log("Dữ liệu đã tải:", scheduleData);
            
        } catch (error) {
            alert("Không thể trích xuất dữ liệu:", error);
        }
    } else {
        alert("Không tìm thấy liên kết Google Sheets");
    }
}

let classSchedule = [];

// Tìm tên lớp nhập trong placeholder và lưu lại thời khóa biểu
function searchClass() {
    let className = document.getElementById('class-input').value.trim().toUpperCase();
    localStorage.setItem('lastClass', className); // set lớp vàp localStorage
    if (!className) {
        alert("Vui lòng nhập lớp");
        return;
    }

    //const newUrl = window.location.origin + window.location.pathname + `?class=${encodeURIComponent(className)}`; // tạo đuôi cho địa chỉ web(tạm không dùng)
    //window.history.pushState({}, '', newUrl);

    classSchedule = [];
    let found = false;

    for (let i = 0; i < scheduleData.length; i++) {
        if (scheduleData[i].some(cell => cell.trim() == className)) {
            found = true;

            for (let j = 0; j < 14 && (i + j) < scheduleData.length; j++) {
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

    const className = classSchedule[0][4];
    const startTime = classSchedule[1][5];
    container.innerHTML = `<h2>Lớp ${className} - Áp dụng từ ngày ${startTime}</h2>`;
    alert("hiện tại web đang lỗi do format mới của thời khóa biểu nhà trường gửi và admin đang đi học🥺,các bạn vui lòng thử lại sau nhé!");
    //in thời khóa biểu -----------------------------------------------------------------
    container.innerHTML += `<h3>Buổi sáng</h3>`;
    
    const morningTable = document.createElement('table');
    morningTable.classList.add('table', 'table-bordered');

    for (let i = 3; i < 9; i++) {
        const tr = document.createElement('tr');

        classSchedule[i].forEach((cell, index) => {
            const cellElement = i === 3 ? document.createElement('th') : document.createElement('td');
            cellElement.textContent = cell;
            tr.appendChild(cellElement);
        });

        morningTable.appendChild(tr);
    }
    container.appendChild(morningTable);

    container.innerHTML += `<h3>Buổi chiều</h3>`;

    const afternoonTable = document.createElement('table');
    afternoonTable.classList.add('table', 'table-bordered');

    for (let i = 11; i < 17; i++) {
        const tr = document.createElement('tr');
        classSchedule[i].forEach((cell, index) => {
            const cellElement = i === 11 ? document.createElement('th') : document.createElement('td');
            cellElement.textContent = cell;
            tr.appendChild(cellElement);
        });
        afternoonTable.appendChild(tr);
    }
    container.appendChild(afternoonTable);

    console.log(classSchedule);
}

// Load dữ liệu khi truy cập vào web
window.onload = async function () {
    await loadData();

    //const urlParameters = new URLSearchParams(window.location.search);
    //let lastClass = urlParameters.get('class'); 

    let lastClass = localStorage.getItem('lastClass');

    if (lastClass) {
        document.getElementById('class-input').value = lastClass;
        searchClass();
    }
};
