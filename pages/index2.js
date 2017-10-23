// Initialize Firebase
var config = {
  apiKey: "AIzaSyCBAGF81h_ZheOZ7RlDmJi-0fDIARjA0J4",
  authDomain: "healthy-a-team-3400.firebaseapp.com",
  databaseURL: "https://healthy-a-team-3400.firebaseio.com",
  projectId: "healthy-a-team-3400",
  storageBucket: "healthy-a-team-3400.appspot.com",
  messagingSenderId: "810324535166"
};

firebase.initializeApp(config);
database = firebase.database();

var dbRef = database.ref();
var ref = database.ref('/Problems/');
var useRef = database.ref('/Users/');
var arcRef = database.ref('/Archive/');

var probSize = 0;
var stringkey;
var monthNames = ["Jan", "Feb" , "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


ref.on('value', gotData, gotErr);

$(document).ready(function() {

  $('#dataTables-example').DataTable({
    responsive: true,
    columns: [
      {title: "Time Submitted", width:'12%'},
      {title: "ETA", width:'10%'},
      {title: "Name", width:'13%'},
      {title: "Age", width:'10%'},
      {title: "Gender", width:'10%'},
      {title: "Symptoms", 'width':'45%'},

    ],
     "order": [[ 0, 'desc' ]],
      "pageLength": 10,
      "aLengthMenu": [ 10, 20, 30, 50 ]
  });


});

var initialLoad = false;
function gotData(data){
  //get snapshot of database for User information
  useRef.once("value").then(function(snapshot){
  var name = data.val();
  var keys = Object.keys(name);


  for (var i = 0; i < keys.length; i++){

    var k = keys[i];
    probSize = keys.length;

    //Retreive all data from Problems data
    var currentTime = name[k].currentTime;
    var eta = name[k].ETA;
    if(eta == null){
      eta = 'unknown';
    }
    var personID = name[k].personID;
    var problem = name[k].problem;
    var seen = name[k].seen;
    var timeArrived = name[k].timeArrived;

    var splitDate = currentTime.split(' ');
    var dayTime = currentTime.split(" ")[4];
    var clockTime = splitDate[3].split(':');
    var etaSplit = eta.split(" ");

    var newEta = 0;
    var minutes;

    if(etaSplit[0] == '<'){
      minutes = parseInt(etaSplit[1])+parseInt(clockTime[1])
      if(minutes > 60){
        minutes = minutes - 60
        if(minutes < 10){
          minutes = '0' + minutes
        }
        while(true){
           if(clockTime[0] == 11){


               if(dayTime == 'AM' || dayTime == 'am'){
                 newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' PM'
                 break;
               }
               if(dayTime == 'PM' || dayTime == 'pm') {
                 newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' AM';
                 break;

               }

             }


          //need to set hour to 1 (not 13)
          if(clockTime[0] == 12){
             newEta = '1:' + minutes + ' ' + dayTime;
             break
           }
           else {
             newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' ' + dayTime;
           }
           break
         }
      }
      else{
         newEta = clockTime[0] +':'+ minutes +' '+ dayTime;
     }

    }
    else{
        minutes = parseInt(etaSplit[0])+parseInt(clockTime[1])
        if(minutes > 60){
          minutes = minutes - 60
          if(minutes < 10){
            minutes = '0' + minutes
          }
          while(true){
             if(clockTime[0] == 11){


               if(dayTime == 'AM' || dayTime == 'am'){
                 newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' PM'
                 break;
               }
               else if(dayTime == 'PM' || dayTime == 'pm') {
                 newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' AM';
               }
               break;
             }


            //need to set hour to 1 (not 13)
             if(clockTime[0] == 12){
               newEta = '1:' + minutes + ' ' + dayTime;
             }
             else {
               newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' ' + dayTime;
             }
             break;
           }

        }
        else{
           newEta = clockTime[0] +':'+ minutes +' '+ dayTime;
       }

    }


    formatTime = clockTime[0] + ':' + clockTime[1] + ' ' + dayTime;



    //setup variables for User information
    var dob;
    var firstName;
    var secondName;
    var gender;
    var phoneNumber;
    var medicare;
    var fullName;

    //get the data from the snapshot and assign with person ID from problems
    var key = snapshot.key;
    if(snapshot.child('/ManuallyEntered/' + personID).val()!=null){
      firstName = snapshot.child('/ManuallyEntered/' + personID + '/firstName/').val();
      secondName = snapshot.child('/ManuallyEntered/' + personID + '/secondName/').val();
      fullName = firstName + ' ' + secondName;
      dob = snapshot.child('/ManuallyEntered/' + personID + '/dob/').val();
      gender = snapshot.child('/ManuallyEntered/' + personID + '/gender/').val();
      phoneNumber = snapshot.child('/ManuallyEntered/' + personID + '/phoneNumber/').val();
      var newDob = dob.split("/")
      var day = newDob[0];
      var month = newDob[1];
      var year = newDob[2];
      var age = convertDob(day, month, year);
    }
    else{
      medicare = snapshot.child('/MedicareEntry/' + personID + '/personId/').val();
      fullName = 'Medicare: ' + medicare;
      dob = ' ';
      gender = ' ';
      phoneNumber = ' ';
      var age = ' ';
    }



    var table = $('#dataTables-example').DataTable();
    stringkey = k.toString();


    var rowNode = table.row.add([
      currentTime,
      newEta,
      '<a data-toggle="modal" data-target="#exampleModalLong" onclick="modal(\''+stringkey+'\')">' + fullName + '</a>',
      age,
      gender,
      problem
    ]).node().id = k;
    table.draw(false);


  }

  intialLoad = true;
  ref.off();
  ref.on('value', newData, gotErr);
  });
}

function newData(data){
  //Listens only for new changes in data
  if(intialLoad){
    intialLoad = false;
    return;
  }

  var name = data.val();
  var keys = Object.keys(name);
  var k = keys[keys.length - 1];

  //This ensures that when data is removed, the dashboard does not re-read and display the latest data
  if(keys.length < probSize){
    probSize = keys.length;
    return;
  }
  probSize = keys.length;

  //Retreive all data from Problems data
  var currentTime = name[k].currentTime;
  var personID = name[k].personID;
  var problem = name[k].problem;
  var seen = name[k].seen;
  var timeArrived = name[k].timeArrived;

  var eta = name[k].ETA;
  if(eta == null){
    eta = 'unknown';
  }

  var splitDate = currentTime.split(' ');
  var dayTime = currentTime.split(" ")[4];
  var clockTime = splitDate[3].split(':');
  var etaSplit = eta.split(" ");

  var newEta = 0;
  var minutes;

  if(etaSplit[0] == '<'){
    minutes = parseInt(etaSplit[1])+parseInt(clockTime[1])
    if(minutes > 60){
      minutes = minutes - 60
      if(minutes < 10){
        minutes = '0' + minutes
      }
      while(true){
         if(clockTime[0] == 11){


             if(dayTime == 'AM' || dayTime == 'am'){
               newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' PM'
               break;
             }
             if(dayTime == 'PM' || dayTime == 'pm') {
               newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' AM';
               break;

             }

           }


        //need to set hour to 1 (not 13)
        if(clockTime[0] == 12){
           newEta = '1:' + minutes + ' ' + dayTime;
           break
         }
         else {
           newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' ' + dayTime;
         }
         break
       }
    }
    else{
       newEta = clockTime[0] +':'+ minutes +' '+ dayTime;
   }

  }
  else{
      minutes = parseInt(etaSplit[0])+parseInt(clockTime[1])
      if(minutes > 60){
        minutes = minutes - 60
        if(minutes < 10){
          minutes = '0' + minutes
        }
        while(true){
           if(clockTime[0] == 11){
             if(dayTime == 'AM' || dayTime == 'am'){
               newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' PM'
               break;
             }
             else if(dayTime == 'PM' || dayTime == 'pm') {
               newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' AM';
             }
             break;
           }
          //need to set hour to 1 (not 13)
           if(clockTime[0] == 12){
             newEta = '1:' + minutes + ' ' + dayTime;
           }
           else {
             newEta = (parseInt(clockTime[0]) + 1) + ':' + minutes + ' ' + dayTime;
           }
           break;
         }
      }
      else{
         newEta = clockTime[0] +':'+ minutes +' '+ dayTime;
     }
  }



  formatTime = clockTime[0] + ':' + clockTime[1] + ' ' + dayTime;

  //setup variables for User information
  var dob;
  var firstName;
  var secondName;
  var gender;
  var phoneNumber;
  var medicare;
  var fullName;


  useRef.once("value").then(function(snapshot){
    var key = snapshot.key;

    if(snapshot.child('/ManuallyEntered/' + personID).val()!=null){
      firstName = snapshot.child('/ManuallyEntered/' + personID + '/firstName/').val();
      secondName = snapshot.child('/ManuallyEntered/' + personID + '/secondName/').val();
      fullName = firstName + ' ' + secondName;
      dob = snapshot.child('/ManuallyEntered/' + personID + '/dob/').val();
      gender = snapshot.child('/ManuallyEntered/' + personID + '/gender/').val();
      phoneNumber = snapshot.child('/ManuallyEntered/' + personID + '/phoneNumber/').val();
      var newDob = dob.split("/")
      var day = newDob[0];
      var month = newDob[1];
      var year = newDob[2];
      var age = convertDob(day, month, year);
    }
    else{
      medicare = snapshot.child('/MedicareEntry/' + personID + '/personId/').val();
      fullName = 'Medicare: ' + medicare;
      dob = ' ';
      gender = ' ';
      phoneNumber = ' ';
      var age = ' ';
    }


    var table = $('#dataTables-example').DataTable();
    var stringkey = k.toString();
    var rowNode = table.row.add([
      currentTime,
      newEta,
      '<a data-toggle="modal" data-target="#exampleModalLong" onclick="modal(\''+stringkey+'\')">' + fullName + '</a>',
      age,
      gender,
      problem
    ]).node().id = k;

  //  $(rowNode).css('background-color', 'yellow');
    table.draw(false);


  });
}

//This function will pull the necessary data to display in the modal
function modal(id){


  var firstName;
  var secondName;
  var dob;
  var timeArrived;
  var personID;
  var symptoms;
  var gender;
  var phoneNumber;
  var patientHistory;
  var fullName;


  ref.once("value").then(function(snapshot){
    var key = snapshot.key;

    timeArrived = snapshot.child(id + '/currentTime/').val();
    personID = snapshot.child(id + '/personID/').val();
    symptoms = snapshot.child(id + '/problem/').val();
    patientHistory = snapshot.child(id + '/additionalSymptoms/').val();

    useRef.once("value").then(function(snapshot){
      if(snapshot.child('/ManuallyEntered/' + personID).val()!=null){
        firstName = snapshot.child('/ManuallyEntered/' + personID + '/firstName/').val();
        secondName = snapshot.child('/ManuallyEntered/' + personID + '/secondName/').val();
        fullName = firstName + ' ' + secondName;
        dob = snapshot.child('/ManuallyEntered/' + personID + '/dob/').val();
        gender = snapshot.child('/ManuallyEntered/' + personID + '/gender/').val();
        phoneNumber = snapshot.child('/ManuallyEntered/' + personID + '/phoneNumber/').val();
      }
      else{
        medicare = snapshot.child('/MedicareEntry/' + personID + '/personId/').val();
        fullName = 'Medicare: ' + medicare;
        dob = ' ';
        gender = ' ';
        phoneNumber = ' ';
      }


      var storageRef = firebase.storage().ref();
      var link = personID+'/'+id
      var imageRef = storageRef.child(link);


      imageRef.getDownloadURL().then(onResolve, onReject);
      document.querySelector('img').src = 'dummy.png'
      function onResolve(url){
        document.querySelector('img').src = url;
       }
      function onReject(error){
        console.log(error.code);
      }



      var pres = document.getElementById("presented");
      var noPres = document.getElementById("noArrival");


      //This clears all fields before loaded the ones desired
      jQuery('#symptoms-text').html('');
      jQuery('#time-text').html('');
      jQuery('#age-text').html('');
      jQuery('#name-text').html('');
      jQuery('#phone-text').html('');
      jQuery('#additional-text').html('');


      var timeAdded = document.createElement("i");
      var age = document.createElement("i");
      var name = document.createElement("i");
      var symptom = document.createElement("p");
      var additional = document.createElement("p");
      var phone = document.createElement("i");

      var timeText = document.createTextNode("Time Added: " + timeArrived);
      var ageText = document.createTextNode("DOB: " + dob);
      var nameText = document.createTextNode("Name: " + fullName);
      var symptomsText = document.createTextNode(symptoms);
      var phoneText = document.createTextNode("Phone Number: " + phoneNumber);
      var additionalText = document.createTextNode(patientHistory);

      timeAdded.appendChild(timeText);
      age.appendChild(ageText);
      name.appendChild(nameText);
      symptom.appendChild(symptomsText);
      phone.appendChild(phoneText);
      additional.appendChild(additionalText);

      var timeElement = document.getElementById("time-text");
      var ageElement = document.getElementById("age-text");
      var nameElement = document.getElementById("name-text");
      var symptomsElement = document.getElementById("symptoms-text");
      var phoneElement = document.getElementById("phone-text");
      var additionalElement = document.getElementById("additional-text");

      timeElement.appendChild(timeAdded);
      ageElement.appendChild(age);
      nameElement.appendChild(name);
      symptomsElement.appendChild(symptom);
      phoneElement.appendChild(phone);
      additionalElement.appendChild(additional);

      //when patient doesn't arrive and you wish to remove from dashboard
      noPres.onclick = function(){removeProb(id)};

      //when patient has arrived and you wish to remove from dashboard and add to archive
      pres.onclick = function(){archive(id)};
    })
  })
}

//This function will activate when the user marks the patient as having arrived and wants to remove them
//Will move the data to an archive table and remove from problems database and dashboard
function archive(id){
  var comment = document.getElementById('staffComments').value;
  var timeAdded;
  var personID;
  var problem;
  var date = new Date();
  var hour = date.getHours();
  var dayTime;
  convertHour(hour);

  //Puts date in same format as timeAdded in problem part of database
  var formatDate = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + hour + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ' + dayTime;

  //converts from 24 hour to 12 hour time
  function convertHour(hour){
    if(hour > 12){
      hour = hour - 12;
      dayTime = 'PM'
    }
    else{
      dayTime = 'AM'
    }
    if(hour == 0){
      hour = 12;
    }
  }

  ref.once("value").then(function(snapshot){
    timeAdded = snapshot.child(id + '/currentTime/').val();
    personID = snapshot.child(id + '/personID/').val();
    problem = snapshot.child(id + '/problem/').val();

    var archiveProblem = {
      timeAdded: timeAdded,
      personID: personID,
      problem: problem,
      timeArrived: formatDate,
      comment: comment
    }

    //Post problem to Archive to store
    var newPostKey = firebase.database().ref().child('Archive').push().key;
    var updates = {};
    updates['/Archive/' + newPostKey] = archiveProblem;

    //Remove current problem from dashboard
    var table = $('#dataTables-example').DataTable();
    table.row("#"+id).remove().draw();

    ref.child(id).remove();
    return firebase.database().ref().update(updates);
  })

}

//This function will remove the problem both from the Dashboard and the Database, but will not Archive it
function removeProb(id){
    ref.once("value").then(function(snapshot){
      var table = $('#dataTables-example').DataTable();
      table.row('#'+id).remove().draw();
      ref.child(id).remove();
    })
}

//Simple function to convert DOB to Age in years
function convertDob(day, month, year){
    var curr = new Date();
    var age = curr.getFullYear() - year;
    var months = curr.getMonth() - month;
    if(months < 0 || (months == 0 && curr.getDate() < day)){
      age--;
    }
    return age;
}


//Log errors
function gotErr(err){
  console.log("Error!");
  console.log(err)
}
