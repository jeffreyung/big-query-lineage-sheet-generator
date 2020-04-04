/**
 * Copyright Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Created by Jeffrey Ung
 * Date: 06/02/2020
 *
 */

 /**
 * The recipients who have view access to the sheet.
 */
const RECIPIENTS = ["jung1@tcs.woolworths.com.au"];

// Spreadsheet data
const ss = SpreadsheetApp.openById("1k6aWvUz4FT8GXhiuxLTCX8K3s2bJDqBzhOBS06tHf2w");
const generatorSheet = ss.getSheetByName('Generator');

// Configurations from the generator shet.
const PROJECT_ID = generatorSheet.getRange(2,3).getValue();
const DATASET_ID = generatorSheet.getRange(3,3).getValue();

// Variable
var cellValues = createCellArray(2000);
var row = 1;
var maxCol = 1;

/**
 * Creates a new cell array.
 * @rowCount is the amount of rows to be created.
 */
function createCellArray(rowCount) {
  var cell = new Array(rowCount);
  for(var y = 0; y < rowCount; y++)
    cell[y] = new Array(100);
  return cell;
}

/**
 * Updates the maximum column of the sheet.
 * @param col is the length of the column.
 */
function updateMaxCol(col) {
  if(maxCol < col)
    maxCol = col;
}

/**
 * @return the lineage sheet that has been generated.
 */
function createLineageSheet() {
  return SpreadsheetApp.create("Tables/Authorised View(s) Lineage - " + DATASET_ID);
}

/**
 * Adds entries to the lineage sheet.
 */
function addLineageSheetEntries() {
  cellValues[0][0] = "A - View(s) in Dataset";
  var viewList = BigQuery.Tables.list(PROJECT_ID, DATASET_ID, {maxResults: 2000});
  if(viewList == null || viewList.tables == null)
    return;
  viewList.tables.forEach(function(item) {
    if(item == null)
      return;
    cellValues[row][0] = item.tableReference.tableId;
    updateCells(PROJECT_ID, DATASET_ID, item.tableReference.tableId, 1);
  });
  cellValues[0][maxCol + 1] = "Comments";
  cellValues[0][maxCol + 2] = "Google Groups";
}
  
/**
 * Recursively updates the cells in the lineage sheet.
 * @param projectId of the table
 * @param datasetId of the table 
 * @param tableId of the table 
 * @param col is the column to be updated.
 */
function updateCells(projectId, datasetId, tableId, col) {
  var dependencyList = getDependencyList(projectId, datasetId, tableId);
  if(dependencyList.length == 0)
    return;
  for(let i = 0; i < dependencyList.length; i++) {
    var dependency = dependencyList[i].replace(/`/g, '');
    var projectDependency = dependency.split(".")[0]
    var datasetDependency = dependency.split(".")[1]
    var tableDependency = dependency.split(".")[2];
    if(projectDependency !== projectId)
      throw projectId + '.' + datasetId + '.' + tableId + ' contains a dependency chain from another project.'
    cellValues[row][col] = datasetDependency + "." + tableDependency;
    updateCells(projectId, datasetDependency, tableDependency, col + 1);
    row++;
  }
  if(col > 1)
    row--;
  cellValues[0][col] = String.fromCharCode(65 + col) + " - Dependent View(s)/Table(s) for " + String.fromCharCode(64 + col);
  updateMaxCol(col);
}

/**
 * Gets the dependency list of a table
 *
 * @param projectId of the table
 * @param datasetId of the table 
 * @param tableId of the table 
 *
 * @return the dependency list of the table.
 */
function getDependencyList(projectId, datasetId, tableId) {
  table = BigQuery.Tables.get(projectId, datasetId, tableId);
  if(table == null || table.view == null)
    return [];
  viewQuery = table.view.query;
  dependencyList = [];
  re = /`(.+?\..+?\..+?)`/g;
  dependencyList = viewQuery.match(re);
  return uniq(dependencyList);
}

/**
 * Filters out any duplicates in a list.
 * @param a is the list to filter.
 *
 * @return the filtered list.
 **/
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}


function execute() {
  lineageSheet = createLineageSheet();
  var sheet = lineageSheet.getActiveSheet();

  lineageSheet.addViewers(RECIPIENTS)
  addLineageSheetEntries();
 
  sheet.setName("Dataset(s)/Table(s)/Authorized View(s) Lineage")
  sheet.getRange(1, 1, 2000, 100).setValues(cellValues);
  sheet.getRange(1, 1, 1, 100)
  .setBackground("GRAY")
  .setFontSize(18)
  .setFontWeight("bold");
  
  for (var i = 1; i < 20; i++)
    sheet.autoResizeColumn(i);
  generatorSheet.getRange(6,3).setValue(lineageSheet.getUrl());  
}
