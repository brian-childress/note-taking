var db, dbresults, itemindex, lat, lon;
var notedata = {notetitle:"", notedetail:"", imagesource:"", notelat:"", notelon:""};
var notetemplate = '<input type="text" name="notetitle" id="notetitle" value="{{notetitle}}" placeholder="Note Title"/><textarea cols="40" rows="8" name="notedetail" id="notedetail" placeholder="Note Detail">{{notedetail}}</textarea><input id="addphoto" type="button" data-icon="plus" value="Add a Photo" /><img id="noteimage" src="{{imagesource}}" /><div id="map">Map Placeholder</div><input id="savenote" type="button" data-theme="a" value="Save Note" />';
$(document).on("pageinit", function(){
	$('#newnote').live('pagecreate', function(event){
		if(itemindex >= 0) {
			item = dbresults.rows.item(itemindex);
			notedata = {notetitle:item.notetitle, notedetail:item.notedetail, imagesource:item.imagesource, notelat:item.notelat, notelon:item.notelon};
	}  
	var html = Mustache.to_html(notetemplate, notedata);
	$("#notedetailcontent").html(html);
	}); 
	$("#newnote").live("pageshow", function(){
		navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);
		if(itemindex >= 0) {
			$("#noteimage").css("display","block");
		}
	});
	$("#addphoto").bind("tap", function(){
		var options = {sourceType:Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI};
		navigator.camera.getPicture(onCameraSuccess, onError, options);
	});
	$("#savenote").bind("tap", function(){
		notedata.notetitle = $("#notetitle").val();
		notedata.notedetail = $("#notedetail").val();
		notedata.imagesource =  $("#noteimage").attr("src");
		notedata.notelat = lat;
		notedata.notelon = lon;
		db.transaction(saveNote, onDbError, onDbSuccess);
	});
});

function init() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	var networkstate = navigator.connection.type;
	if(networkstate == "none")
	{
		$(".offline").css("visibility","visible");
	}
	db = window.openDatabase("Notes", "1.0", "Saved Notes", 200000);
	db.transaction(getDbNotes, onDbError, onDbSuccess);
}

function getDbNotes(tx) {
	tx.executeSql("CREATE TABLE IF NOT EXISTS NOTES (notetitle, notedetail, imagesource, notelat, notelon)");
	tx.executeSql("SELECT * FROM NOTES", [], onSelectNotesSuccess, onDbError);
}

function onSelectNotesSuccess(tx, results) {
	dbresults = results;
	var len = results.rows.length;
	for(var i = 0; i<len; i++) {
		$("#notelist").append("<li><a href=#newnote onclick='itemindex=" + i + ";'>" + results.rows.item(i).notetitle + "</a></li>");
	}
	$("#notelist").listview("refresh");
}

function saveNote(tx) {
	tx.executeSql("INSERT INTO NOTES (notetitle, notedetail, imagesource, notelat, notelon) VALUES (?, ?, ?, ?, ?)",[notedata.notetitle, notedata.notedetail, notedata.imagesource, notedata.notelat, notedata.notelon]);
}

function onGeoSuccess(position) {
	lat = position.coords.latitude;
	lon = position.coords.longitude;
	var currentposition = new google.maps.LatLng(lat,lon);
	
	var mapoptions = {
		zoom: 12,
		center: currentposition,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	var map = new google.maps.Map(document.getElementById("map"), mapoptions);
	

	var marker = new google.maps.Marker({
			position: currentposition,
			map: map
	});
}

function onCameraSuccess(imageURI) {
	$("#noteimage").attr("src", imageURI);
	$("#noteimage").css("display","block");
}

function onDbSuccess(tx, results) {
	console.log('Database call successful');
}

function onGeoError(error) {
	if( error == 1) {
		alert('Turn on Geolocation services.');
	}
}

function onError(message) {
	alert(message);
}

function onDbError(error) {
	alert("Database error " + error.message);
}
