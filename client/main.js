
//  EVAL 03 - Open Weather API 
//  jim eisenstein 
//  08.09.2020

const apiKey  = '720e7b51b7a5e08d1c429fba0c9eedf2';
const exclude = '&exclude=hourly,minutely';
const units   = '&units=imperial';   
const dayName = ['s u n d a y', 'm o n d a y', 't u e s d a y', 'w e d n e s d a y', 't h u r s d a y', 'f r i d a y', 's a t u r d a y'];

let showForecastFrames = true;
let weatherReportUpdateList = [];

// ******** Controller **************************************************************
//
// All changes to Model's data and then an updated display are initiated by button click events
// Search button events send a list of weather data updates to Model
// Errors in the retrieval of data alert Model.  Model has View display an error message.
// Erase button instructs the View to clear the input line.

// searchButtonHandler - MVC Controller
// On Search button press, submit API request for current weather conditions 
// at the user specified location.

const searchButtonHandler = function () {
    $('#search-button').on('click', function () {
        var search = $('#search-query').val();

        const pollstarQuestionAPI = `https://api.openweathermap.org/data/2.5/weather?q=${search}${units}&appid=${apiKey}`;
        const currentWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?q=${search}${units}&appid=${apiKey}`;
        if (search.length > 0) { fetchBoy(currentWeatherAPI, processCurrentWeatherJson, errorHandler); }
    });
}
// eraseButtonHandler - MVC Controller
// On X button press, alert View to erase any entered text in the location entry field
// Redisplay standard input instructions

const eraseButtonHandler = function () {
    $('#erase-button').on('click', function () {

        // Queue up instructions to erase the text field and redisplay instructions
        let viewStack = [
            { id: "search-query", attributeName: "value", value: "" },
            { id: "search-query", attributeName: "placeholder", value: "Enter City Name" }
        ];  
        renderBoy(viewStack);    // pass this to View for immediate update
    });
    return;
}

// fetchBoy - MVC Controller
// Submit OW API request for current weather conditions and forecast at the specified location 

const fetchBoy = function (queryAPI, successCallback, errorCallback) {
    $.ajax(
        {
            method: "GET",
            url: queryAPI,
            dataType: "json",
            success: function (data) { successCallback(data) },
            error: function (jqXHR, textStatus, errorThrown) {
                errorCallback(jqXHR, textStatus, errorThrown);
            }
        }
    );
}

// errorHandler - MVC Controller
// Inform Model of error. Include an error message to be displayed

const errorHandler = function (jqXHR, textStatus, errorThrown) {

    let errorCode = jqXHR.status;   // Error Code
    let errorMessage = jqXHR.responseJSON.message;
    let errorCity = document.getElementById('search-query').value;

    let errorMessageStack = [{ id: 'search-query', attributeName: 'value', value: '' }]; // clear the text input field

    if (errorCode === 404) {
        errorMessageStack.push({ id: "search-query", attributeName: "placeholder", value: `Hmmm...couldn't find a city called ${errorCity}.  Try Again?` });
    } else {
        errorMessageStack.push({ id: "search-query", attributeName: "placeholder", value: `uh oh... Code ${errorCode}: ${errorMessage}.  Go Get Mom!` });
    }
    alertModel(errorMessageStack, jqXHR, textStatus, errorThrown);
}

// processCurrentWeatherJson -  MVC Controller
// Invoked when the json for current weather conditions at the given location is returned.
// Longitude/latitude geo-coordinates from the json are used in the API request for the 7-day forecast.
// The weather report data for is queued up to be sent to the model.
// the 7-Day Forecast request API is sent.

const processCurrentWeatherJson = function (rawCurrentWeatherJson) {

    // Queue up the current weather data for this location
    weatherReportUpdateList.push({ id: "search-query", attributeName: "placeholder", value: "Enter City Name" });
    weatherReportUpdateList.push({ id: "location-now1", attributeName: "innerHTML", value: rawCurrentWeatherJson.name });
    weatherReportUpdateList.push({ id: "temp-now1", attributeName: "innerHTML", value: Math.round(rawCurrentWeatherJson.main.temp) + "&deg" });
    weatherReportUpdateList.push({ id: "weather-now1", attributeName: "innerHTML", value: rawCurrentWeatherJson.weather[0].description });
    weatherReportUpdateList.push({ id: "icon-now1", attributeName: "src", value: `weather-icons/${rawCurrentWeatherJson.weather[0].icon}@4x.png` });

    // Use the longitude and latitude coordinates of the location from the 
    // current weather json to populate the 7-day forecast Open Weather API
    const sevenDayForecastAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${rawCurrentWeatherJson.coord.lat}&lon=${rawCurrentWeatherJson.coord.lon}${exclude}${units}&appid=${apiKey}`;
    fetchBoy(sevenDayForecastAPI, process7DayForecastJson, errorHandler);
}

// process7DayForecast - MVC Controller
// Callback processes the 7-day forecast json into weather data update records
// and sends them to the model

const process7DayForecastJson = function (raw7DayForecastJson) {
   
    // Extract data and process update records for a new 5-day forecast from the 7-day forecast json
    // Each value in the json that will be updated on the forecast page is formatted and pushed onto
    // the weather report update list along with the its Element ID and the attribute of the field to be updated.

    for (let i = 0; i < 5; i++) {
        weatherReportUpdateList.push({ id: `weather-day${i + 1}`,  attributeName: "innerHTML", value: raw7DayForecastJson.daily[i].weather[0].main });
        weatherReportUpdateList.push({ id: `temp-day${i + 1}`,     attributeName: "innerHTML", value: Math.round(raw7DayForecastJson.daily[i].temp.max) + "&deg" });
        weatherReportUpdateList.push({ id: `icon-day${i + 1}`,     attributeName: "src",       value: `weather-icons/${raw7DayForecastJson.daily[i].weather[0].icon}@4x.png` });

        let dayOfWeek = new Date(raw7DayForecastJson.daily[i].dt * 1000);
        weatherReportUpdateList.push({ id: `name-day${i + 1}`, attributeName: "innerHTML", value: dayName[dayOfWeek.getDay()] });
    }
    if (showForecastFrames) {
        // show the daily forecast frames if the update flag is set
        weatherReportUpdateList.push({ id: `forecast-day1`, attributeName: "style", value: `box-shadow: -20px 15px 20px rgba(220, 220, 220, 32)` });
        weatherReportUpdateList.push({ id: `forecast-day2`, attributeName: "style", value: `box-shadow: -10px 15px 10px rgba(220, 220, 220, 32)` });
        weatherReportUpdateList.push({ id: `forecast-day3`, attributeName: "style", value: `box-shadow:   0px 15px 10px rgba(220, 220, 220, 32)` });
        weatherReportUpdateList.push({ id: `forecast-day4`, attributeName: "style", value: `box-shadow:  10px 15px 10px rgba(220, 220, 220, 32)` });
        weatherReportUpdateList.push({ id: `forecast-day5`, attributeName: "style", value: `box-shadow:  20px 15px 20px rgba(220, 220, 220, 32)` });
        showForecastFrames = false; // and clear the display flag
    }
    updateModel(weatherReportUpdateList);
}

// ******** View **************************************************************

// renderBoy - MVC View  
// Update the view from the queue of update records.
// Each record in the queue holds an element id, an attribute to be updated, and a formatted value.

const renderBoy = function (displayUpdateList) {

    while (0 < displayUpdateList.length) {
        
        let record = displayUpdateList.pop();

        switch (record.attributeName) {
            case 'innerHTML':
                document.getElementById(record.id).innerHTML = record.value;
                break;

            case 'src':
                document.getElementById(record.id).src = record.value;
                break;

            case 'style':
                document.getElementById(record.id).style = record.value;
                break;

            case 'placeholder':
                document.getElementById(record.id).placeholder = record.value;
                break;
            
            case 'value':
                document.getElementById(record.id).value = record.value;
                break;
        }
    } 
}
// ******** Model **************************************************************

//  Formatted and tagged data is sent from Controller to Model 
//  And  Model, finding nothing for it to do, passes it along
//  to View to be displayed.

const updateModel = function (displayUpdateList) {
    renderBoy(displayUpdateList);
    return;
}
const alertModel = function (displayUpdateList) {
    renderBoy(displayUpdateList);
    return;
}

//  MAIN Initialization

showForecastFrames = true;  // display the daily forecast frame graphic
searchButtonHandler();        // init the search button event handler
eraseButtonHandler();       // init the erase button event handler

