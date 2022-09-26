function createCookie(username, token){
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const d = new Date();
    let time = d.getHours() + 1;
    if(time > 23){
        time = 0;
    }
    const expTime = `${time}:${d.getMinutes()}:${d.getSeconds()}`
    const expDate = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${expTime}`;
    document.cookie = `username=${username} expires=${expDate}; path=http://localhost:3000/main`;
    document.cookie = `token=${token} expires=${expDate}; path=http://localhost:3000/main`;
}