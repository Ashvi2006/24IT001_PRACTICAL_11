
import "./Performance.css";

const students = Array.from({ length: 10 }, (_, index) => {
  const no = index + 1;

  const withoutCache = 20 + (no % 11);
  const withCache = 2 + (no % 4);

  const improvement = (
    ((withoutCache - withCache) / withoutCache) *
    100
  ).toFixed(2);

  return {
    no,
    name: `Student ${no}`,
    withoutCache,
    withCache,
    improvement,
  };
});

function Performance() {
  return (
    <div className="performance-page">
      <h1>Student Performance</h1>

      <p className="performance-description">
        Comparison of API response time with and without cache memory
      </p>

      <div className="table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Student Name</th>
              <th>Without Cache Memory</th>
              <th>With Cache Memory</th>
              <th>Performance Improvement (%)</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.no}>
                <td>{student.no}</td>
                <td>{student.name}</td>
                <td>{student.withoutCache} ms</td>
                <td>{student.withCache} ms</td>
                <td>{student.improvement}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default  Performance;



