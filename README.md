Fenix UI Table Creator
========================
FENIX component to create and visualize a table


#Initialize the component

Instance the object and then pass this object into the method render()
```bash
{
  * "container" : ""        // class or id of the dom container
  * "model":{
        "data": [],         // data expressed into fenix standard
        "metadata":{}       // metadata expressed into fenix standard
  },
  + "options":{
        "hidden_columns":[] // array of column 's ids or column's subjects
  }

}
```
*attributes are mandatories
+attributes are optionals

