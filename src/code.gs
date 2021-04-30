var cc = DataStudioApp.createCommunityConnector();
function getConfig() {
  var config = cc.getConfig();
  config
    .newInfo()
    .setId('instructions')
    .setText(
      'Enter your API url or Json data feed url to pull data.'
    );

  config.newTextInput()
    .setId('url')
    .setName('URL')
    .setAllowOverride(false);

  config.newTextInput()
    .setId('account_id')
    .setName('Account ID')
    .setHelpText('e.g. 2659 for client ')
    .setAllowOverride(false);


  config.setDateRangeRequired(true);

  return config.build();
}

function getFields(request) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  var url = request.configParams.url;

  try {

    var response = UrlFetchApp.fetch(url + '?schema=1')
    var data = JSON.parse(response)

    data['schema'].map(function(field) {
      var type = types.TEXT;
      switch(field['type']){
        case 'number':
          type = types.NUMBER;
          break;
        case 'date':
          type = types.YEAR_MONTH_DAY;
          break;
        case 'boolean':
            type = types.BOOLEAN;
            break;
        case 'percent':
            type = types.PERCENT;
            break;
        case 'currency':
            type = types.CURRENCY;
            break;
        case 'url':
            type = types.URL;
            break;
        default:
          type = types.TEXT;
          break;
          
      }

      fields.newMetric()
      .setId(field['id'])
      .setName(field['name'])
      .setDescription(field['description'])
      .setType(type);

    } )

  
  } catch (e) {
      cc.newUserError()
      .newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText('There was an error communicating with the service. Try again later, or file an issue if this error persists.')
      .throwException();
  }

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: getFields(request).build()};
}


function getData(request) {
  try {
    var response = fetchDataFromApi(request);
    var data = JSON.parse(response.getContentText());

    var requestedFieldIds = request.fields.map(function(field) {
      return field.name;
    });
    
    //var requestedFieldIds = ['campaign_name','clicks']
    var requestedFields = getFields(request).forIds(requestedFieldIds);  

    var rows = responseToRows(requestedFields,data);
    
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }
  var result = {
    schema: requestedFields.build(),
    rows: rows
  };
  return result;

}

function responseToRows(requestedFields, data) {

  return data.map(function(d) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {

      var v = d[field.getId()];
      if( field.getType().toString() == "YEAR_MONTH_DAY"){
        v = v.split("-").join("");
      }
      return row.push(v);
      
    });
    return { values: row };
  });
}

function fetchDataFromApi(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  }).join(',');
  
  if (undefined == requestedFieldIds || null == requestedFieldIds ) requestedFieldIds = '';
  
  var url = [
    request.configParams.url,
    '?',
    'account_id=', request.configParams.account_id,
    '&',
    'date_start=', request.dateRange.startDate,
    '&',
    'date_stop=', request.dateRange.endDate,
    '&',
    'fields=',requestedFieldIds
  ];

  var response = UrlFetchApp.fetch(url.join(''));
  return response;
}



function getAuthType() {
    console.log("getAuthType call");
    return {'type': 'NONE'};
}
