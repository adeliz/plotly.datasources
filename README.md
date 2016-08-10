# plotly.datasources
Plotly extension to add datasources support into JSON model

The goal of this extension is to add the ability to set datasources in the json file that describes a chart.

## JSON specification of chart's file

A complete Json file chart is defined as below :

```javascript
{
  "data":[], //See Plotly
  "layout":{}, //See Plotly
  "datasources":[],
  "configuration":{} //See Plotly
}
```

The data sources object is an array of data source where each element can be request parameters or data.
It is defined this way for web requests :

```javascript
{
  "id":"uniq", //uniq id of the datasource
  "url":"http://",
  "method":"GET" //current supported method is only GET
  "parameters":{ //parameters can be specified in a key/value format
  }
}
```

or, this way, if data are included in the json file :

```javascript
{
  "id":"uniq", //uniq id of the datasource
  "data":"x,y,color\n1,2,#F00\n2,5,#0F0\n3,4,#0FF"
  }
}
```

The data sources can be then used in the traces objects as a source specification:
```javascript
{
  "id":"", //id of the data source
  "formatter":"", //Name of the formatter defined in Plotly.formatters (see below)
  "script":"", //Use only if formatter is null. Must return data object (see below)
  "parameters":{
    //Parameters are specifics to each formatter (see below). They are also passed as arguments to the function defined in the script attribute
  }
}
```

## Examples
* [Finance](https://bl.ocks.org/adeliz/b46591ef00d54ba24d1cd554ea86fa20) : Load json file
* [Weather](https://bl.ocks.org/adeliz/a3603ba0dc1b1f9869f51f9f46e120dd) : Programmatically, create plot with data source
* [Earthquakes](https://bl.ocks.org/adeliz/0c948773b2641c722fe5e51acaa35585): Programmatically, update data sources

There's also a [viewer](https://rawgit.com/adeliz/plotly.datasources/master/examples/viewer.html) where you can drag an drop a json file or [pass the url of a json file as a url's parameter](https://rawgit.com/adeliz/plotly.datasources/master/examples/viewer.html?url=https://gist.githubusercontent.com/adeliz/e0f01adf89b8ea75b15df8629c125c3c/raw/songs.json) 

## Formatters
Because, most of the time, data from web services are not in the right format for Plotly, you can use or define formatters. A formatter will transform the data received from the web service and will return a object where each attribute is an attribute of a Plotly trace.

For example, a formatter for a scatter plot should return this kind of object :
```javascript
{
	x:[],
	y:[],
	text:[],
	"errors_x.array":[],
	"errors_y.array":[]
}
```

Formatters can be defined in 2 ways :
* in the script parameter
* as a Javascript function. 

```javascript
//myformatter will be use as the formatter's name in the source object of a trace 
Plotly.formatters.myformatter = function(response,parameters){ //First argument is the data, Second argument is the parameters defined in the source object of the trace
	//Do your transformations...
	return {
		x:[],
		y:[]
	};
}
```
There are already 2 predefined formatters :
* CSV: set separated values to Plotly attributes using name and corresponding column index. Separator can also be defined (todo : add header parameter to define how many lines are used for header). Example :
```javascript
"parameters" : {
	"separator":";",
	"x":0,
	"y":1,
	"text":2,
	"errors_x.array":7,
	"errors_y.array":8
}
``` 
* KDB: set KairosDB data to x,y data

