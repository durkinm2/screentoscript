const OS = require('opensubtitles-api');
const OpenSubtitles = new OS({
    useragent:'OSTestUserAgentTemp',
    // username: 'Username',
    // password: 'Password',
    ssl: true
});
OpenSubtitles.search({
    sublanguageid: 'en',       // Can be an array.join, 'all', or be omitted. 
    hash: '8e245d9679d31e12',   // Size + 64bit checksum of the first and last 64k 
    filesize: '129994823',      // Total size, in bytes. 
    path: 'foo/bar.mp4',        // Complete path to the video file, it allows 
                                //   to automatically calculate 'hash'. 
    filename: 'bar.mp4',        // The video file name. Better if extension 
                                //   is included. 
    season: '2',
    episode: '3',
    extensions: ['srt', 'vtt'], // Accepted extensions, defaults to 'srt'. 
    limit: '3',                 // Can be 'best', 'all' or an 
                                // arbitrary nb. Defaults to 'best' 
    imdbid: '528809',           // 'tt528809' is fine too. 
    fps: '23.96',               // Number of frames per sec in the video. 
    query: 'Charlie Chaplin',   // Text-based query, this is not recommended. 
    gzip: true                  // returns url to gzipped subtitles, defaults to false 
}).then(subtitles => {
    // an array of objects, no duplicates (ordered by 
    // matching + uploader, with total downloads as fallback) 
 
    subtitles = Object {
        en: {
            downloads: "432",
            encoding: "ASCII",
            id: "192883746",
            lang: "en",
            langName: "English",
            score: 9,
            url: "http://dl.opensubtitles.org/download/subtitle_file_id",
            filename: "some_movie.tag.srt"
        }
        fr: {
            download: "221",
            encoding: "UTF-8",
            id: "1992536558",
            lang: "fr",
            langName: "French",
            score: 6,
            url: "http://dl.opensubtitles.org/download/subtitle_file_id",
            filename: "some_movie.tag.srt"
        }
    }
});