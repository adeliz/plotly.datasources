# plotly.requests
Plotly extension to add requests support into JSON model

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

The data sources object is an array of data source where each element is defined this way :
```javascript
{
  "id":"uniq", //uniq id of the datasource
  "url":"http://",
  "method":"GET" //current supported method is only GET
  "parameters":{ //parameters can be specified in a key/value format
  }
}
```
The data sources can be then used in the traces objects as a source specification:
```javascript
{
  "id":"", //id of the data source
  "converter":{
     "name":"", //Name of the converter
     "script":"", //Use only if name is null. Must return data object. See below
     "parameters":{
       //Parameters are specifics to each converter. See below. They are also passed as arguments to the function defined in the script attribute
     }
  }
}
```

## Examples
* [Finance](https://bl.ocks.org/adeliz/b46591ef00d54ba24d1cd554ea86fa20) : Load json file
* [Weather](https://bl.ocks.org/adeliz/a3603ba0dc1b1f9869f51f9f46e120dd) : Programmatically, create plot with data source
* [Earthquakes](https://bl.ocks.org/adeliz/0c948773b2641c722fe5e51acaa35585): Programmatically, update data sources

## Converters
Because, most of the time, data from web services are not in the right format for Plotly, you can use or define converters. A converter will transform the data received from the web service and will return a object where each attribute is an attribute of a Plotly trace.

For example, a converter for a scatter plot should return this kind of object :
```javascript
{
	x:[],
	y:[],
	name:[],
	"errors_x.array":[],
	"errors_y.array":[]
}
```

Converters can be defined in 2 ways :
* in the script parameter
* as a Javascript function. 

```javascript
//myconverter will be use as the converter's name in the source object of a trace 
Plotly.converters.myconverter = function(response,parameters){ //First argument is the web request reponseText, Second argument is the parameters defined in the trace object
	//Do your transformations...
	return {
		x:[],
		y:[]
	};
}
```
There are already 2 predefined converters :
* CSV: set separated values to x,y data with the following parameters : columnX, columnY, separator (todo : header)
* KDB: set KairosDB data to x,y data

