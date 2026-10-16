// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const dns = require('node:dns');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection 

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
}, { timestamps: true });
const Employee = mongoose.model('Employee', employeeSchema);
const handleError = (res, error) => {
    if (error.name === 'CastError' || error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    console.error(error);
    return res.status(500).json({ message: 'An unexpected server error occurred.' });
};
const employeeFields = body => ({ name: body.name, location: body.location, position: body.position, salary: body.salary });
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'

app.get('/api/employeelist', async (req, res) => {
    try { res.json(await Employee.find().sort({ _id: 1 })); }
    catch (error) { handleError(res, error); }
});




//TODO: get single data from db  using api '/api/employeelist/:id'

app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found.' });
        res.json(employee);
    } catch (error) { handleError(res, error); }
});





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.post('/api/employeelist', async (req, res) => {
    try { res.status(201).json(await Employee.create(employeeFields(req.body))); }
    catch (error) { handleError(res, error); }
});






//TODO: delete a employee data from db by using api '/api/employeelist/:id'

app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found.' });
        res.json({ message: 'Employee deleted successfully.', employee });
    } catch (error) { handleError(res, error); }
});





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.put('/api/employeelist', async (req, res) => {
    try {
        const employeeId = req.body._id || req.body.id;
        if (!employeeId) return res.status(400).json({ message: 'Employee id (_id) is required.' });
        const employee = await Employee.findByIdAndUpdate(employeeId, { $set: employeeFields(req.body) }, { new: true, runValidators: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found.' });
        res.json(employee);
    } catch (error) { handleError(res, error); }
});


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not set. Add your MongoDB Atlas connection string to the environment.');
        process.exitCode = 1;
    } else {
        // Use the public resolvers that successfully resolved this Atlas SRV record.
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        mongoose.connect(mongoUri).then(() => {
            console.log('Connected to MongoDB Atlas.');
            app.listen(PORT, () => console.log(`Employee app listening on port ${PORT}.`));
        }).catch(error => {
            console.error('Could not connect to MongoDB Atlas:', error.message);
            process.exitCode = 1;
        });
    }
}
module.exports = app;



