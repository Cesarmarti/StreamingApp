var express = require('express');
var router = express.Router();

var fs = require('fs');
var multer  = require('multer');
var busboy = require('connect-busboy');
var bodyParser = require('body-parser');
var qs = require('querystring');
router.use(express.json());

var directory = __dirname;
var parent_directory = modifyPath();

const movieFolder = parent_directory+"/movies";

router.use(busboy()); 

router.use(bodyParser.json());  
router.use(express.urlencoded({  
  extended: true  
})); 


router.get('/', function (req, res) {
    res.redirect('/public/index.html');
})

router.get('/list_movies',function (req, res){
    console.log("GET request for movies");
    res.sendFile( parent_directory +"/public/movieList.html");
})

router.get('/uploader',function (req, res){
    console.log("GET request for uploader");
    res.sendFile( parent_directory +"/public/uploader.html");
})


router.post('/movie_upload',function (req, res){
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading movie: " + filename); 
        fstream = fs.createWriteStream(parent_directory + '/movies/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
    
})

router.get('/retrieve_movies',function (req, res){
    console.log("GET request for movie list");
    var movies = [];
    fs.readdir(movieFolder, (err, files) => {
        files.forEach(file => {
            movies.push(file);
        });
        res.send(movies);
    });
})

router.get("/picker/watch/:movie",function(req,res){
    res.write('<html>');
    res.write('<body>');
    res.write('<video id="videoPlayer" controls>');
    res.write('<source src="/picker/'+req.params.movie+ '"type="video/mp4">');
    res.write('</video>');
    res.write('</body>');
    res.write('</html>');

    res.end()
})

router.get("/picker/:movie",function(req,res){
    const path = parent_directory+'\\movies\\'+req.params.movie;
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] 
          ? parseInt(parts[1], 10)
          : fileSize-1
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
})


//TODO
function removeExt(file){

}

function modifyPath(){
    var parent = (__dirname).substring(0, (__dirname).lastIndexOf("\\"));
    return parent;
}
module.exports = router;