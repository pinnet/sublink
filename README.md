# sublink
Subtitle Link java-script subtitles with a glossary of hyperlinks for content providers

Design Goals for V0.1

1 No dependant framework -          needs refactor to eliminate global vars

2 Inline                            can be loaded in one script tag

3 Basic Config                      not complete

4 transparent windows               need to complete absolute div placement

5 scrubbing transport               Working.

    Two files required - the subtitles of the video playing in srt format.
    and a json file of the glossery of hyperlinks with keywords to match.

Theroy of opperation:

During loading of the page a fetch is called on the srt file and json file, when the promises are fullfilled, build a select/option block in transcript, while parsing subtitles match json file and insert link index marker (in the form '{'index'}') after the target word found in the json file.
When the video is in playback, read transcript text element when the timestamp matches and then print it to the titles element, if there is a index marker match (regex '\{\d{1,4}\}') subsitute keyword with a hypertext link added around the matching keyword.

NEW = support me on Patreon - https://www.patreon.com/dannyarnold