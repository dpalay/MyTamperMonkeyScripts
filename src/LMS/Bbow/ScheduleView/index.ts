type ScrapedData = {
	time: string;
	date: string;
	location: string;
	name: string;
	capacity: string;
}

type GroupedData = {
	[date: string]: {
		[location: string]: {
			name: string;
			time: string;
			capacity: string;
		}[];
	};
}



const colorPalette = ['#F8B195', '#F67280', '#C06C84', '#6C5B7B',
	'#99B898', '#E84A5F', '#999966', '#A8E6Ce', '#DCEDC2', '#FFAAA6',
	'#E1F5C4', "#EC2049", '#EDE574', '#F9D423', '#F9D', '#FC913A',
	'#FF4E50', '#F9D423', '#FFA07A', '#FFB7D5', '#FFC0A8', '#FFE5D9']


const dataTable = document.getElementById('tblSearchResults') as HTMLTableElement


let scheduleView = document.getElementById("scheduleView")
if (!scheduleView) {
	scheduleView = document.createElement('div')
	scheduleView.id = 'scheduleView'
	dataTable.parentElement?.appendChild(scheduleView)
}

// Create text that goes above the HTML table that toggles between Show Schedule and Show Table.  
// When Show Schedule is clicked, the table should be hidden and the schedule should be shown.
// When Show Table is clicked, the schedule should be hidden and the table should be shown.
// The table should be shown by default
const toggleText = document.createElement('div')
toggleText.innerHTML = '<a id="toggleView" href="javascript:void(0)">Show Schedule</a>'
dataTable.parentElement?.insertBefore(toggleText, dataTable)

let showSchedule = false
const toggleView = document.getElementById('toggleView')

if (toggleView) {
	toggleView.addEventListener('click', () => {
		showSchedule = !showSchedule
		if (!showSchedule) {
			toggleView.innerHTML = 'Show Schedule'
			console.log(dataTable.style)
			dataTable.style.setProperty('display', 'table')
			scheduleView?.style.setProperty('display', 'none')
		}
		else {
			toggleView.innerHTML = 'Show Table'
			dataTable.style.setProperty('display', 'none')
			scheduleView?.style.setProperty('display', 'block')
			console.log(dataTable.style)
		}
	})
}



// set up a mutation observer for the table. if it changes any of the contents, re-generate the schedule
const observer = new MutationObserver(() => {
	if (showSchedule && scheduleView ) {
		scheduleView.innerHTML = generateHTMLTable(dataTable)
	}
	console.log("Table changed")
})
observer.observe(dataTable, { childList: true, subtree: true })

const groupData = function (data: ScrapedData[]) {
	return data.reduce((grouped: GroupedData, item) => {
		let date = item.date;
		let location = item.location;

		if (!grouped[date]) {
			grouped[date] = {};
		}

		if (!grouped[date][location]) {
			grouped[date][location] = [];
		}

		grouped[date][location].push({ name: item.name, time: item.time, capacity: item.capacity.split(' / ')[0] });
		return grouped;
	}, {});
}


//collect the names from the data into a Map and randomly assign each a color from colorPalette with no duplicate colors
function collectNames(data: ScrapedData[]) {
	let names = new Map()
	let colorIndex = 0
	data.forEach(item => {
		if (!names.has(item.name)) {
			names.set(item.name, colorPalette[colorIndex])
			colorIndex = (colorIndex + 1) % colorPalette.length
		}
	})
	return names
}


/**
 * 
 * @param groupedData 
 * @param colors {Map<string, string>} Map of names to colors, e.g. { 'name1': '#FF6633', 'name2': '#FFB399'}
 * @returns 
 */
function generateHTMLTable(sourceTable: HTMLTableElement) {
	console.log("Generating Table")
	let rows: HTMLTableRowElement[] = []
	let data: ScrapedData[] = []
	if (!sourceTable) {
		alert('No table found')
		return '<div></div>'
	}
	else if (sourceTable.innerText.includes('No results matched the criteria')) return '<div></div>'
	else {
		rows = Array.from((sourceTable as HTMLTableElement).rows).splice(1)
		data = rows.map(row => {
			return {
				time: row.cells.item(5)?.innerText || "",
				date: row.cells.item(4)?.innerText || "",
				location: row.cells.item(6)?.innerText || "",
				name: row.cells.item(2)?.innerText || "",
				capacity: row.cells.item(7)?.innerText || ""
			}
		})

		const groupedData = groupData(data)
		const colors = collectNames(data)

		let html = '<div id="scheduleViewContainer">';
		for (let date in groupedData) {
			html += `<h3>${date}</h3><table style="border-spacing: 0 10px; width: 100%;">`;
			html += `<tr ><th style="width:25%; text-align:center">Location</th>`;
			for (let i = 14; i < 41; i++) {
				html += `<th style="width:2%; text-align:left;">${i % 2 === 0 ? (i / 2 > 12 ? i / 2 - 12 : i / 2) : ''}</th>`;
			}
			let keys = Object.keys(groupedData[date]).sort()
			keys.forEach(location => {
				html += `<tr style="text-align:center"><td style="text-align:left;">${location}</td>`;
				let cells = new Array(48 - 14).fill('<td style="width:2%"></td>');
				let indexOffset = 0
				groupedData[date][location].forEach(item => {
					if (item.capacity == '0') { return }
					let times = item.time.split(' - ');
					let start = convertTo24Hour(times[0]);
					let end = convertTo24Hour(times[1].replace(' CDT', ''));
					let [startHour, startMinute] = start.split(':').map(Number);
					let [endHour, endMinute] = end.split(':').map(Number);
					let startDate = new Date(1970, 0, 1, startHour, startMinute);
					let endDate = new Date(1970, 0, 1, endHour, endMinute);
					let startIndex = startDate.getHours() * 2 + Math.floor(startDate.getMinutes() / 30) - 14 - indexOffset;
					let endIndex = endDate.getHours() * 2 + Math.floor(endDate.getMinutes() / 30) - 14 - indexOffset;
					for (let i = startIndex; i < endIndex; i++) {
						const diff = endIndex - startIndex;
						cells[i] = `<td colspan=${diff} style="background: ${colors.get(item.name)}; border: 1px solid #222;">${item.name} - ${item.capacity}</td>`;
						i += diff - 1
						indexOffset += diff - 1
						for (let j = 0; j < diff; j++) { cells.pop() }
					}
				});
				html += cells.join('') + '</tr>';
			})
			html += '</table><br/>';
		}

		return html + "</div>";
	}
}

function convertTo24Hour(time: string) {
	let [hours, minutes] = time.split(':');
	minutes = minutes.split(' ')[0]; // Remove AM/PM from minutes
	let hour = parseInt(hours);
	let isPM = time.match(/pm$/i) !== null;
	if (isPM && hour < 12) hour += 12;
	if (!isPM && hour === 12) hour = 0;
	return `${hour.toString().padStart(2, '0')}:${minutes}`;
}


scheduleView.innerHTML = generateHTMLTable(dataTable)