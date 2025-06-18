// script.js (honeypot-dashboard 저장소에 푸시)
document.addEventListener('DOMContentLoaded', function() {
    // dashboard_data.json 파일이 GitHub Pages에 같은 경로에 있다고 가정하고 상대 경로로 로드합니다.
    fetch('dashboard_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('last-updated').textContent = new Date(data.last_updated).toLocaleString();

            // Daily Hits Chart (Bar Chart)
            const dailyHitsChartDiv = d3.select("#daily-hits-chart");
            const margin = { top: 20, right: 30, bottom: 40, left: 40 };
            const width = dailyHitsChartDiv.node().getBoundingClientRect().width - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            dailyHitsChartDiv.selectAll("svg").remove(); // 기존 차트 제거 (리사이즈 핸들링용)

            const svg = dailyHitsChartDiv.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .range([height, 0]);

            x.domain(data.daily_hits.map(d => d.date));
            y.domain([0, d3.max(data.daily_hits, d => d.count)]);

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .call(d3.axisLeft(y));

            svg.selectAll(".bar")
                .data(data.daily_hits)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.date))
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.count))
                .attr("height", d => height - y(d.count));

            // Top IPs List
            const topIpsList = d3.select("#top-ips-list");
            topIpsList.selectAll("li").remove(); // 기존 목록 제거
            topIpsList.selectAll("li")
                .data(data.top_ips)
                .enter().append("li")
                .html(d => `${d.ip} <span>(${d.count} 회)</span>`);

            // All Logs Table
            const allLogsTableBody = d3.select("#all-logs-table tbody");
            allLogsTableBody.selectAll("tr").remove(); // 기존 행 제거
            allLogsTableBody.selectAll("tr")
                .data(data.all_logs)
                .enter().append("tr")
                .html(d => `
                    <td>${d.ip}</td>
                    <td>${d.user_agent}</td>
                    <td>${d.token}</td>
                    <td>${new Date(d.timestamp).toLocaleString()}</td>
                    <td>${d.accept_language || 'N/A'}</td> <!-- Accept-Language 추가 -->
                `);

            // 창 크기 변경 시 차트 다시 그리기
            window.addEventListener('resize', () => {
                location.reload(); // 간단하게 페이지 새로고침하여 데이터 및 차트 다시 로드
            });

        })
        .catch(error => console.error('Error fetching dashboard data:', error));
});
