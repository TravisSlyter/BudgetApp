
// BUDGET CONTROLLER
//keeps track of the budget 
var budgetController = (function() {
  
    //create an object constructor to store our data
  var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
  };
    
  Expense.prototype.calcPercentage = function(totalIncome) { //lecture 95. calculates.
      if (totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
          this.percentage = -1;
      }
      
  };
    
  Expense.prototype.getPercentage = function() { //lecture 95. returns it.
      return this.percentage;
  };
    
  var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
  };
    
  var calculateTotal = function(type) { //lecture 86
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
        sum += cur.value; //same as sum = sum + cur.value
    });
    data.totals[type] = sum; //where we are going to store our value
    /*
    sum = 0
    [200, 400, 100]
    sum = 0 +200
    sum = 200 + 400
    sum = 600 + 100 = 700
    */
  };
    
  var data = {
      allItems: {
          exp: [],
          inc: []
      },
      totals: {
          exp: 0,
          inc: 0
      },
      budget: 0,
      percentage: -1 //-1 is commonly used when it is not 0, but nonexistent
  };
    
    return { //public function that will allow other modules to enter data into the 
        addItem: function(type, des, val) {              //budget controller
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {
               //create new ID  lect82 10:30
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            }
            
            
            
            //create new tiem based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push it into our data structure
            data.allItems[type].push(newItem);//very handy, 'type' lect.82 6:28.
            
            // return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) { //lect91
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() { // lecture 86
           
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() { //lecture 95
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            //calculates the percentage for each item in the exp array by using the forEach method. *
            data.allItems.exp.forEach(function(cur) { 
                cur.calcPercentage(data.totals.inc);
            });
                
        },
        
        
        getPercentages: function() { //lecture 95
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          };  
        },
            
        
        testing: function() {
            console.log(data);
        }
    };
  
    
})();




// UI CONTROLLER
var UIController = (function() {
    
//we created the below object to store all the doc.queryselectors, in the future if we change one of the .add, we only have to change it here, not all over the app.
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) { // lecture 97
          
          /*
          + or - before number
          exactly 2 decimal points
          comma seperating the thousands
          
          2310.4567 -> + 2,310.46
          2000 -> + 2,000.00
          */
          
          num = Math.abs(num); // creates the absolute of the number. no +/-.
          num = num.toFixed(2); // converts to 2 decimal points
          
          numSplit = num.split('.');// seperating the number from decimal to add comma
          
          int = numSplit[0];
          if (int.length > 3) {
              int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);//input 2310, output 2,310
          }
          
          
          dec = numSplit[1];
          
          return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
          
      };
    
      var nodeListForEach = function(list, callback) {// lecture 99
              for (var i = 0; i < list.length; i++) {
                  callback(list[i], i);
              }
          };
  
  //this return is how we make these vars accessible to the global scope so we can access them in other modules.
  return {
      getInput: function() { //instead of returning var / return an object with 3 var
          return {      // object syntax remember
           type: document.querySelector(DOMstrings.inputType).value, //will be inc or exp
           description: document.querySelector(DOMstrings.inputDescription).value,
           value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
          }; //parseFloat() is a js function, converts from a string to a number
        },
      
      addListItem: function(obj, type) {  //lecture 83
          var html, newHtml, element;
          // Create HTML string with placeholder text
          if (type === 'inc') {
              element = DOMstrings.incomeContainer;
              
              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          } else if (type === 'exp') {
              element = DOMstrings.expensesContainer;
              
              html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }
           
          // Replace the placeholder text with some actual data
          
          newHtml = html.replace('%id%', obj.id);
          newHtml = newHtml.replace('%description%', obj.description);
          newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
          //the first argument is what we are replacing, the 2nd argument is what we are replacing it with.
          
          
          //Insert the HTML into the DOM
          document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
          
      },
      
      // deleting an item from the list
      deleteListItem: function(selectorID) { //lecture 92
         
          var el = document.getElementById(selectorID);
          el.parentNode.removeChild(el);
          
      },
    
      //clear the input boxes in the UI, lecture 84
      clearFields: function() { 
          var fields, fieldsArr;
          
          fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
          //querySelectorAll however only returns a list not an array, so we need convert it to an array so we do the below.
          
          //lecture 84, 6:04. trick for converting list to an array
          fieldsArr = Array.prototype.slice.call(fields); 
          
          //loop over the array and set values to 0. lect 84, 9:00.
          fieldsArr.forEach(function(current, index, array) {
              current.value = "";
          });
          
          //put the cursor back to the first element of the array (inputDescription).
          fieldsArr[0].focus(); 
          
      },
      
      displayBudget: function(obj) { //lect 87
          var type;
          
          obj.budget > 0 ? type = 'inc' : type = 'exp';//added in lect 97.
          
          document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
          document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
          document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
          
          
          if (obj.percentage > 0) {
              document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
          } else {
              document.querySelector(DOMstrings.percentageLabel).textContent = '---';
          }
          
      },
      
      displayPercentages: function(percentages) { //lecture 96
          
          var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
          
          //moved so we could access it
          /*var nodeListForEach = function(list, callback) {
              for (var i = 0; i < list.length; i++) {
                  callback(list[i], i);
              }
          };*/
          
          nodeListForEach(fields, function(current, index) {
              
              if (percentages[index] > 0) {
                  current.textContent = percentages[index] + '%';
              } else {
                  current.textContent = '---';
              }
          });
          
      },
      
      displayMonth: function() { // lecture 98
          var now, month, months, year;
          
          now = new Date();
          
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          month = now.getMonth();
          
          year = now.getFullYear();// method that gets the year
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
          
      },
      
      changedType: function() { // lecture 99. The function we use to change the style of the input fields.
          
          var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
          
          
          nodeListForEach(fields, function(cur) {
             cur.classList.toggle('red-focus');
          });
          
          document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
          
      },
      
        
      getDOMstrings: function() { //exposing the DOMstrings to the public so we can 
          return DOMstrings;      //access it in the Global Controlller
      }
  };
  
  
})();





// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    
    
    var setupEventListeners = function() {
      var DOM = UICtrl.getDOMstrings();// access to the the DOMstrings  
        
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
     //console.log('button was pressed'); check
      
    document.addEventListener('keypress', function(event) {
            //console.log(event); you can check the keycode
        if (event.keyCode === 13 || event.which === 13) {  //'which' for older browsers
            ctrlAddItem();
        }   
      });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //lect90
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);//lect 99. 
        
    };
    
    var updateBudget = function() {
        
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function() { // lecture 94
        
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages, lecture 96.
          //console.log(percentages);
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function() { //created this function for our keypress 
        var input, newItem;
        
        
      // 1. get the field input data
        input = UICtrl.getInput();
        //console.log(input);
        
        //this checks the inputs to not be blank. lecture85, 9:00. !isNaN is handy to check if it is a not a number, it should not be not a number.
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
          // 2. add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);//lect82 12:50

          // 3. add new item to UI
            UICtrl.addListItem(newItem, input.type); //lecture83 18:00

          //4. Clear the fields  lecture 84, 10:00
            UICtrl.clearFields();

          //5. Calculate and update budget
            updateBudget();
            
          // 6. Calculate and update percentages
            updatePercentages();

            }
            
  
    };
    
    var ctrlDeleteItem = function(event) { //lect90, 91
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages  
            updatePercentages();
            
        }
        
    };
  
    //this is our public initilization function, to run our event listeners.
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({ //sets everything in the ui to 0 to start
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
          });
            setupEventListeners();
        }
    };
  
})(budgetController, UIController);

controller.init(); //our only line of code on the outside, this starts everything because our event listeners are in the init function.