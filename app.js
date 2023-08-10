// node_modules 에 있는 express 관련 파일을 가져온다.
const express = require('express');
const bodyParser = require('body-parser');

// uuid-apikey 생성 및 사용
const uuidAPIKey = require('uuid-apikey');

// express 는 함수이므로, 반환값을 변수에 저장한다.
const app = express();

// req.body를 사용하기 위해서는 body parser를 미들웨어로 파싱해야 함.
// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlendocded
app.use(bodyParser.urlencoded({extended : false}));


/*
file을 upload하기 위한 html 파일 웹서버로 서비스 하기 위한 코드 
app.use(express.static(publicPath)); 미들웨어를 등록한 덕분에 public 폴더 내에 존재하는 파일을 Serving 할 수 있는 상태다.
그런데 index.html(파일업로드)은 루트 페이지를 가리키는 특별한 파일명이기 때문에 GET /index.html이 아닌 GET /으로 접속해도 index.html 파일의 내용을 반환해준다.
*/
const path = require('path');
const publicPath = path.join(__dirname, 'public');
console.log('publicPath = ', publicPath)
app.use(express.static(publicPath));

/*
multer사용하기 : 이미지 업로드도 특별할 것은 없다.
x-www-form-urlencoded, json과 같이 이미지를 문자열 쪼가리로 변환하여 스트림으로 서버에 전송해 주는 것이 전부다.
명칭이 조금 다른데, multipart/form-data라는 형식으로 request body에 이미지 데이터가 첨부된다.
이 미들웨어는 multipart/form-data 형식의 body를 파싱해서 파일로 다시 변환하고 dest에 등록된 경로에 업로드한다.
*/
const multer = require('multer');

// dest 값은 저장하고자 하는 폴더를 지정함.
const upload = multer({
	dest: 'files/'
});

const uploadMiddleware = upload.single('myFile'); // upload.single() 하나의 파일만 업로드 할때....
app.use(uploadMiddleware);

/*
POST - File Upload. req.file에 file정보 기록되어 있음.
    import requests

    url = "http://localhost:3000/api/upload"
    payload = {}
    files=[
    ('myFile',('스크린샷 2023-08-08 오전 11.08.55.png',open('/Users/tvswtdd/Desktop/스크린샷 2023-08-08 오전 11.08.55.png','rb'),'image/png'))
    ]
    headers = {}
    response = requests.request("POST", url, headers=headers, data=payload, files=files)
    print(response.text)
*/
app.post('/api/upload', (req, res) => {
    console.log(req.file);
    res.status(200).send('uploaded');
});


//console.log(uuidAPIKey.create());
//발급받은 키와 uuid. 실제 서비스엔 별도의 DB로 관리하면 된다. 지금은 로컬...
const key = {
    apiKey: 'CSAZGPF-KDN4D02-HZJQ7TD-VA5ZR3E',
    uuid: '6655f859-9b6a-4680-8fe5-73e9da8bfc0d'
  };



let userlist = [
    { id : 1, name : 'Hong Gill Dong', age : 10 },
    { id : 2, name : 'Kim Jeong Eun', age : 11 },
    { id : 3, name : 'Jang Dong Gun', age : 12 },
    { id : 4, name : 'Hong Gill Dong', age : 13 },
    { id : 5, name : 'Hong Gill Dong', age : 14 },
]


userlist.map((item, index) => {
    console.log(index, item);
});

// Data의 전달 경로는 Path, Query, Body를 통해 받을 수 있다.
function displayInfo(req, res) {
    console.log('req.params = ', req.params); // Path
    console.log('req.query = ', req.query);   // Query
    console.log('req.route = ', req.route);
    console.log('req.header = ', req.header);
    console.log('req.body = ', req.body);     // Body
}

function checkIsVaildUser(apiKey, uuid)
{
    if(uuidAPIKey.isAPIKey(apiKey) && uuidAPIKey.check(apiKey, uuid)) 
    { 
        return true;
    }
    else
    {
        return false;
    }
}


// rest api
app.get('/api', async(req, res) => {
    displayInfo(req, res);
    if(checkIsVaildUser(getApiKey, key.uuid)) 
    { 
        res.send("UUID-API Key is vaild");
    }
    else
    {
        res.send("UUID-API Key is invaild");
    }
});


/*
GET - User List를 서버로부터 얻어온다.
    Python code - Get Request.
    import requests
    url = "http://localhost:3000/api/users"
    payload = {}
    headers = {}
    response = requests.request("GET", url, headers=headers, data=payload)
    print(response.text)
*/
app.get('/api/users', async(req, res) => {
    displayInfo(req, res);
    res.send(userlist);
});

/*
GET - 인증된 사용자가 User List를 서버로부터 얻어온다.
    import requests

    url = "http://localhost:3000/api/CSAZGPF-KDN4D02-HZJQ7TD-VA5ZR3E/users"
    payload = {}
    headers = {}
    response = requests.request("GET", url, headers=headers, data=payload)
    print(response.text)
*/
app.get('/api/:apikey/users', async(req, res) => {
    displayInfo(req, res);
    const getApiKey = req.params.apikey;
    if(checkIsVaildUser(getApiKey, key.uuid)) 
    { 
        res.json({ Auth : true, users : userlist });
    }
    else
    {
        res.json({ Auth : false, users : undefined });
    }
});


/*
GET - Path 상으로 Param을 받아서 해당 Param에 맞는 정보만 찾아 전달함.
*/
app.get('/api/users/:id', async(req, res) => {
    displayInfo(req, res);

    //let {user_id} = req.params;
    //console.log('user_id = ', user_id)
    const user_id = req.params.id

    //filter라는 함수는 자바스크립트에서 배열 함수이다. 필터링을 할때 많이 사용된다 필터링한 데이터를 새로운 배열로 반환한다.
    const user = userlist.filter(data => data.id == user_id);    

    res.send(user);
});

app.get('/api/:apikey/users/:id', async(req, res) => {
    displayInfo(req, res);

    //let {user_id} = req.params;
    //console.log('user_id = ', user_id)
    const user_id = req.params.id

    //filter라는 함수는 자바스크립트에서 배열 함수이다. 필터링을 할때 많이 사용된다 필터링한 데이터를 새로운 배열로 반환한다.
    const user = userlist.filter(data => data.id == user_id);    

    res.send(user);
});


/*
POST - User를 User List에 추가한다.
1. param으로 data를 전달해서 추가하는 방법
2. body로 받아 추가 : x-www-form-urlencoded, raw(JSON) 등 형태로...
   post : http://localhost:3000/api/users

*/
app.post('/api/users', async(req, res) => {
    displayInfo(req, res);
    res.send("OK");
});


/*
POST - User를 User List에 추가한다.
1. param으로 data를 전달해서 추가하는 방법
   post : http://localhost:3000/api/users/add?name=Twice Kim&age=20

2. body로 받아 추가 : x-www-form-urlencoded, raw(JSON) 등 형태로...
    import requests
    import json

    url = "http://localhost:3000/api/users/add"
    payload = json.dumps({
    "name": "James.Hong",
    "age": 67
    })
    headers = {
    'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
*/
app.post('/api/users/add', async(req, res) => {
    displayInfo(req, res);
    console.log('req.body.name = ', req.body.name);
    console.log('req.body.age = ', req.body.age);

    let vid = userlist.length+1;
    let vname = req.body.name;
    let vage = req.body.age;
    /* 
    query로 받아올 경우
    let vname = req.query['name'];
    let vage = req.query['age'];
    */
    console.log('vname = ', vname, ' vage = ', vage);
    userlist.push({id: vid, name : vname, age : vage });

    res.send(userlist);
});


/*
Patch - 단일 데이터를 업데이트 할때 사용 (해당 index의 값 변경)
    import requests
    import json

    url = "http://localhost:3000/api/users/update/1"

    payload = json.dumps({
    "name": "Heeyoung.Park",
    "age": 155
    })

    response = requests.request("PATCH", url, headers=headers, data=payload)
    print(response.text)
*/
app.patch('/api/users/update/:id', async(req, res) => {
    displayInfo(req, res);

    const user_id = req.params.id;
    const { name } = req.body;
    const { age } = req.body;

    //map 함수는 자바스크립트에서 배열 함수이다. 요소를 일괄적으로 변경할 때 사용됩니다.
    const user = userlist.map((user) => {
        if(user.id == user_id)
        {
            if(name !== undefined) { user.name = name; }
            if(age !== undefined) { user.age = age; }
        }

        return {
            id: user.id,
            name: user.name,
            age: user.age,
        }
    })

    res.json({ok: true, users: user})
});

/*
Put - 전체 데이터를 업데이트 할때 사용
    import requests
    import json

    url = "http://localhost:3000/api/users/update/2"

    payload = json.dumps({
    "name": "Gilbong.Hong",
    "age": 155,
    "addr": "osan"
    })
    headers = {
    'Content-Type': 'application/json'
    }

    response = requests.request("PUT", url, headers=headers, data=payload)

    print(response.text)
*/
app.put('/api/users/update/:id', async(req, res) => {
    displayInfo(req, res);

    const user_id = req.params.id;
    // 구조분해를 통해 name 와 age을 추출
    const { name, age } = req.body

    const keylist = Object.keys(req.body);

    //map 함수는 자바스크립트에서 배열 함수이다. 요소를 일괄적으로 변경할 때 사용됩니다.
    const user = userlist.map(user => {

        if(user.id == user_id) 
        {
            let item = { id: user_id };

            user.name = name; 
            user.age = age; 
            for (var i = 0; i < keylist.length; i++)
            {
                item[keylist[i]] = req.body[keylist[i]]
                console.log('key = ',keylist[i], ' value = ', req.body[keylist[i]], ' item = ', item);
            }    
            return item;
        }
        else
        {
            return {
                id: user.id,
                name: user.name,
                age: user.age,
            }    
        }
    })

    res.json({ok: true, users: user})
});


/*
Delete - User 삭제
    import requests

    url = "http://localhost:3000/api/users/3"
    payload = {}
    headers = {}

    response = requests.request("DELETE", url, headers=headers, data=payload)
    print(response.text)
*/
app.delete('/api/users/:id', (req, res) => {
    const user_id = req.params.id

    //filter라는 함수는 자바스크립트에서 배열 함수이다. 필터링을 할때 많이 사용된다 필터링한 데이터를 새로운 배열로 반환한다.
    userlist = userlist.filter(user => user.id != user_id);

    res.json({ok: true, users: userlist})
});


// 3000 포트로 서버 오픈
app.listen(3000, function() {
    console.log("start! express server on port 3000")
})


