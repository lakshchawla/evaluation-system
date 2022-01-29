var multer = require('multer');
var fs =  require('fs');
var path = require ('path');

var imageSchema = new mongoose.Schema({
    name:String,
    email: String,
    img:{
        data: String,
        contentType: String
    }
});
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, 'pdf' + '-' + Date.now() + '.pdf')
    }
});
  
var upload = multer({ storage: storage });

var fileUploadModel = new mongoose.model('Image', imageSchema);

app.get('/show-entries', (req, res) => {
    fileUploadModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('showInputs', { items: items });
        }
    });
});

app.get('/upload', (req,res) =>{
    res.render('upload');
})

app.get('/downloadFile/:reqSite', function (req, res) {
    var file = path.join(__dirname + '/uploads/' + req.params.reqSite);

    res.download(file, function (err) {
        if (err) {
            console.log("Error");
            console.log(err);
        } else {
            console.log("Success");
        }
    });
 });

// app.get("/downloadPDF", (req, res) => {
//     res.download("uploads/image-1642697451400.pdf");
// });


app.post('/upload', upload.single('image'), (req, res, next) => {
    
    // console.log(path.join(__dirname + '/uploads/' + req.file.filename + '.pdf'));

    var obj = {
        name: req.body.name,
        email: req.body.desc,
        img: {
            data: req.file.filename,
            contentType: 'application/pdf'
        }
        
    }
    fileUploadModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            console.log("File Uploaded");
            res.send('Registration Successfull');
        }
    });
});

var port = process.env.PORT || '3001'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})