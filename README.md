# Introduction
An automation tool which accurately finds the data lineage for views in a Google BigQuery dataset and places the result in a Google Sheet.

Data lineage is commonly used in data governance to improve risk management (i.e., ensuring that the correct access is provided to the end-users). The tool was created because the risk of manual error increases when complex queries and long data lineage are involved - which is why it is necessary to automate the process. 

# How To Use

If you want to connect it to a Google Sheet to insert values into the parameter using cells - do the following:

1) In the variable <b>var ss</br>, change the value of <i>"1k6aWvUz4FT8GXhiuxLTCX8K3s2bJDqBzhOBS06tHf2w</i> to the ID of your spreadsheet.
2) In the variable <b>var PROJECT_ID</br>, change the value to the cell which points to the Google Cloud project ID.
3) In the variable <b>var DATASET_ID</br>, change the value to the cell which points to the BigQuery dataset ID. 
4) Ensure that BigQuery API is enabled in the Google Script and that the user has read-access at minimum.
