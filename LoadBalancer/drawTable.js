export default function drawTable(data){
    let buffer = data.toString();
    let lines = buffer.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        console.log(data)
      }catch (err) {
        console.error('Parse lỗi:', err.message);
      } 
    }
}