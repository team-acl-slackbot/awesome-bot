const fetch = require('node-fetch');

const fetchAssignments = async() =>{
    const data = await fetch('http://canvas.instructure.com/api/v1/courses/2612860/assignments?bucket=upcoming&per_page=4',{
                method:'GET',
                headers:{Authorization:'Bearer 7~qSAu85MaKUcToKP4muZ5EfFodZ070TmO0WfKw5RhZjLuXGC8TINyixK3j7aajaH1'}
            })
    const jsonData = await data.json();

    return jsonData
}

const convertDueDate = (isoDate)=>{
    const date = new Date(isoDate);
    return date.toLocaleString()
}
module.exports= {
    fetchAssignments,
    convertDueDate,
};