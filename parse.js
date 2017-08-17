var fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv = require('iconv-lite'),
    readline = require('linebyline'),
    // subUrl = 'Jackie.Brown.1997.1080p.Bluray.x264.anoXmous_eng.srt';
    subUrl = 'tests/Pulp.Fiction.1994.720p.BrRip.x264.YIFY.srt';
    // url = 'http://www.imsdb.com/scripts/Pulp-Fiction.html';
    // url = 'http://www.imsdb.com/scripts/Jackie-Brown.html';
    // url = 'http://www.imsdb.com/scripts/Matrix,-The.html';
    // url = 'http://www.imsdb.com/scripts/Big-Lebowski,-The.html';
    // url = 'http://www.imsdb.com/scripts/Inception.html';
    url = 'http://www.imsdb.com/scripts/Feast.html';
    // url = 'http://www.imsdb.com/scripts/Superbad.html';
    // url ='http://www.imsdb.com/scripts/Star-Trek-The-Motion-Picture.html';

var title = /[^/]+$/.exec(url)[0].replace('.html','.txt');

var requestOptions = { encoding: null, method: "GET", uri: url};

request(requestOptions,function(err,resp,body) {

  var utf8String = iconv.decode(new Buffer(body), "ISO-8859-1");

  if (!err) {
  	var $ = cheerio.load(utf8String);

    var children = $('td[class=scrtext]').children('pre');

    // scrape html to find where script starts
    for (let i = 0; i < 10; i++) {
      if($(children).children('pre').length != 0){
        children = $(children).children('pre').contents();
        console.log("lala "+children.length);
        break;
      }
      else{
        children = $(children).contents();
        break;
      }
    }

    var lines = []; // all lines with text
    var speechLines = []; // just lines with dialogue
    var index = 1, speechIndex = 0;

  	var textOutStr = '';
    var speechOutStr = ''; // concats dialogue into one big string, may be useful for comparing
    var sectionOrder = [5]; // "scene", "action", "speech", "character", "transition"

      for (let lineNum = 0; lineNum < 300; lineNum++) {
      	let elem = $(children)[lineNum]; // current child DOM properties
      	let fullLine = $(elem).text(); // line(s) of text including whitespaces
      	let whiteLineCount = fullLine.split("\n\n"); // splits dialogue by "paragraphs"
        let spaces = fullLine.search(/\S|$/); // Determines sections by number of spaces until text
        let loc = fullLine.substring(spaces, spaces+4);
        let lineText = fullLine.trim();

        let isTransition = /[A-Z]+:$/g; // e.g. FADE IN:, CUT TO: ...
        let isParenthetical = /\(([^)]+)\)/; // e.g. (laughing), (whispering)
        let isScene = loc.match(/INT.|EXT./); // will match with INTERIOR | EXTERIOR

/* --------------- finds initial lengths for each part --------------- */

        // finds first INT or EXT and starts there
      if (lines.length == 0 && elem.type === "tag" && isScene) {
          lines[0] = {type : "scene", data : lineText};
          // console.log(lines[0]);
          sectionOrder[0] = spaces;
          sectionOrder[1] = spaces;

  		} else if (lines.length == 0 && lineText.match(isTransition)) {
          lines[0] = {type : "transition", data : lineText};
          sectionOrder[0] = spaces;

        // if scene heading
      } else if (lines.length > 0 && elem.type === "tag" && isScene) {
          lines[index] = {type : "scene", data : lineText};

        // if action
      } else if (lines.length > 0 && spaces == sectionOrder[1] && elem.name !== "b") {
          lines[index] = {type : "action", data : lineText};

        // if transition
      } else if (lineText.match(isTransition)) {
          lines[index] = {type : "transition", data : lineText};
          sectionOrder[4] = spaces;

        // if character
      } else if (lines.length > 0 && elem.type === "tag" && lineText.length > 0) {
          lines[index] = {type : "character", data : lineText};
          sectionOrder[3] = spaces;

        // if speech - assumes speech always comes after character
      } else if (lines.length > 1 && elem.type === "text" && spaces > sectionOrder[1] && lines[index-1].type === "character") {

          let nextLine = isParenthetical.exec(whiteLineCount[0]);
          let splitSpeech = whiteLineCount[0].replace(/ *\([^)]*\) */g, '');

          // parenthesis
          if (whiteLineCount[0].match(isParenthetical)){
            lines[index] = {type : "parenthetical", data : nextLine[0]};
            index++;
          }

          lines[index] = {type : "speech", data : splitSpeech};

          speechOutStr = speechOutStr.concat(splitSpeech.replace(/\s+/g, ' '));
          speechLines[speechIndex] = splitSpeech.replace(/\s+/g, ' ');
          speechIndex++;

          sectionOrder[2] = spaces;

        // checks for >1 blocks of dialogue separated by a white line
        if (whiteLineCount.length > 1 && whiteLineCount[1].match(/\w+/)) {
    			let temp = '';
    			let x = 1;
    			  while (x < whiteLineCount.length && whiteLineCount[x].match(/\w+/)) {
    				  temp = temp.concat(whiteLineCount[x].trim());
              x++;
    			  }

          index++;
    			lines[index] = {type : "action", data : temp};

        }

        // find next transition if, say, FADE TO: comes before CUT TO:
        // figure out how to better categorize misc
      } else if (lines.length > 0) {

          for (let i = 0; i < whiteLineCount.length; i++){

            if (whiteLineCount[i].match(/\w+/) && i < whiteLineCount.length - 1){
              lines[index] = {type : "action", data : whiteLineCount[i]};
              index++;

            } else if (whiteLineCount[i].match(/\w+/) && i == whiteLineCount.length - 1) {
              lines[index] = {type : "action", data : whiteLineCount[i]};

            }
          }

        } else {
          index--;
        }
        index++;
      }

      textOutStr = JSON.stringify(lines,null,'\t');
      textOutStr = textOutStr.replace(/ [ \r\n]+/gm, '\n');
      textOutStr = textOutStr.replace(/ *\\n+|\\t+/gm, ' ');
      textOutStr = textOutStr.replace(/.*null,/gm, '');

  	fs.writeFile(__dirname + '/tests/'+title, textOutStr, function(err){
  		console.log("written to file: " + title);
  	});

  } else {
  	console.log("error: "+ error);
  }

/*--------- subtitles ------------*/
  const rl = readline(subUrl);
  var subLines = '', s = '';

  rl.on('line', function (line, lineCount, byteCount) {
    s = line.toString();
    if (s.match(/^\d+/) == null && s != '' && lineCount < 50){
      subLines = subLines.concat(s);
    }

  // subs that end in "..."
    if (s.match(/\.{3}$/) && lineCount < 500){
      // console.log(lineCount+" "+s);
    }
  }).on('error', function(e){
    console.log("error w readline");
  });

  for (let i = 0; i < speechLines.length; i++){
    // console.log(speechLines[i]);
  }

});
