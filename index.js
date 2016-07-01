//Save Plotly functions before to override them
var FnewPlot = Plotly.newPlot;
var Fplot = Plotly.plot;
var FaddTraces = Plotly.addTraces;
var Frestyle = Plotly.restyle;

Plotly.converters = {};

//Override plot function
Plotly.plot = function(gd, data, layout, datasources, config){
	//Call parent's function
	FnewPlot(gd, data, layout, config);
	//get html element because gd can be a string or a DOM element
	var gd = getGraphDiv(gd);
	//set datasources to the DOM element
	gd.datasources=datasources;
	//load data to traces from data sources
	loadData(gd,data,datasources);
}

//Override newPlot function
Plotly.newPlot = function(gd, data, layout, datasources, config){
	Plotly.plot(gd, data, layout, datasources, config);
}

//Override addTraces function
Plotly.addTraces = function(gd, traces, newIndices){
	//Call parent's function
	FaddTraces(gd, traces, newIndices);
	//get html element because gd can be a string or a DOM element
	var gd = getGraphDiv(gd);
	//load data to traces from data sources
	loadData(gd,traces,gd.datasources);
}

//Override restyle function
Plotly.restyle = function(gd, update, indices){
	//Call parent's function
	Frestyle(gd, update, indices);
	//get html element because gd can be a string or a DOM element
	var gd = getGraphDiv(gd);
	//check if source is updated
	for(var key in update){
		if(key.indexOf("source")>-1){
			//load data to traces from data sources
			loadData(gd,gd.data,gd.datasources);
			break;
		}
	}
	
}

//Update datasources
Plotly.updateDataSources = function(gd, update){
	//get html element because gd can be a string or a DOM element
	var gd = getGraphDiv(gd);
	//set datasources to the DOM element
	gd.datasources=update;
	//load data to traces from data sources
	loadData(gd,gd.data,gd.datasources);
}

Plotly.converters.KDB = function(response,parameters){

	var resp=JSON.parse(response);
	var xy=[[],[]];
	var values  =resp.queries[0].results[0].values;
	for (var i = 1; i < values.length; i++) {
		xy[0].push(new Date(values[i][0]));
		xy[1].push(parseFloat(values[i][1]));
	}
	return xy;
};

Plotly.converters.CSV = function(response,parameters){
	var xy=[[],[]];
	var lines = response.split("\n");
	var separator=",";
	if(parameters!=null){
		if(parameters.separator!=null){
			var separator=parameters.separator;
		}
	}
	for (var i = 1; i < lines.length; i++) {
		
		var val = lines[i].split(separator);
		xy[0].push(new Date(val[parameters.columnX]));
		xy[1].push(val[parameters.columnY]);
	}

	return xy;
};


//
function loadData(gd,traces,datasources,tIndices,dsIndices){
	//For each datasource, execute the request
	for(var i=0;i<datasources.length;i++){
		(function(index){
			
			var u = datasources[index].url;
			for(key in datasources[index].parameters){
				u += key + "=" +datasources[index].parameters[key] + "&"
			}
			
			var updateTraces = function(u){
				Plotly.d3.xhr(u,function(error, result) {

					//For each trace 
					for(var k=0;k<traces.length;k++){
						//Check if it uses a data source
						if(traces[k].source!=null){
							//If it's the current datasource
							if(traces[k].source.id==datasources[index].id){
								//Use a specified converter or a script
								if(traces[k].source.converter.name!=null){
									var xy = Plotly.converters[traces[k].source.converter.name](result.responseText,traces[k].source.converter.parameters);
									Frestyle(gd,{x:[xy[0]],y:[xy[1]]},k);
								}else{
									//Use script attribute to create a new function and execute it
									var tmpFunc = new Function('response','param',traces[k].source.converter.script);
									var xy = tmpFunc(result.responseText,traces[k].source.converter.parameters);
									Frestyle(gd,{x:[xy[0]],y:[xy[1]]},k);
								};
							}
						}
					}
				});
			};
			
			updateTraces(u);
			
		})(i)
	}
}

function refreshData(gd,traces,datasources,tIndices,dsIndices){
	var refresh = 5;
	console.log(datasources);
	if(refresh){
		var id = setInterval(function(){loadData(gd,traces,datasources,tIndices,dsIndices);},refresh*1000);
	}
}

// Get the container div: we store all variables for this plot as
// properties of this div
// some callers send this in by DOM element, others by id (string)
function getGraphDiv(gd) {
	var gdElement;

	if(typeof gd === 'string') {
		gdElement = document.getElementById(gd);

		if(gdElement === null) {
			throw new Error('No DOM element with id \'' + gd + '\' exists on the page.');
		}

		return gdElement;
	}
	else if(gd === null || gd === undefined) {
		throw new Error('DOM element provided is null or undefined');
	}

	return gd;  // otherwise assume that gd is a DOM element
}