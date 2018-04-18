var app = new Vue({
    el: '#app',

    data: {
        username: '',
        name: '',
        password: '',
        userID: '',
        answerCounter: 0,
        number: '',
        max: 0,
        currentDrink: '',
        currentPicture: '',
        currentCorrectAnswer: '',
        selectedDrinkIndex: 0,
        drinksAndPicturesArray: [],
        drinkIndexesArray: [],
        guessedDrinks: [],
        startButton: false,
        nextQuestionButton: false,
        signInScreen: true,
        quizScreen: false,
        areYouSureMessage: false,
        forgotPass: true,
        message: '',
        forgotten:'',
        results: '',
        results: '',
        answerA: '',
        answerB: '',
        answerC: '',
        answerD: '',
        answerArray: ["answerA", "answerB", "answerC", "answerD"],
        correctArray: ["Right you are!", "Attaboy!", "Righto!", "Hot Dawg!", "Couldn’t have done it better myself",
                        "Right on", "Outstanding", "Right on the money"],
        incorrectArray: ["Incorrect: Sorry my friend", "Incorrect", "Incorrect: Better luck next time",
                        "Incorrect: What are you? Mormon?", "Incorrect: sorry Shirley Temple",
                        "Incorrect: I guess you only know the virgin drinks"],
},

    created: function() {
        this.cocktail();
    },

    watch: {
        number: function(value,oldvalue) {
            if (oldvalue === '') {
                this.max = value;
            } else {
                this.cocktail();
            }
        },
    },

    computed: {

    },

    methods: {
        login: function() {
            return axios.post("api/login", {
                username: this.username,
                password: this.password,
                })
                .then(response => {
                        this.userID = response.data.user.id;
                        this.answerCounter = response.data.user.numberCorrect;
                        this.name = response.data.user.name;
                        this.message = "";
                        this.signInScreen = false;
                        this.startButton = true;
                        this.forgotten = "";
                        return true;
        }).catch(error => {
            if (error.response) {
            if (error.response.status === 403){
                this.message = "Invalid Login";
            }
            else if (error.response.status === 409)
            return;
            }
        });
    },

        register: function() {
            return axios.post("api/register", {
                username: this.username,
                password: this.password,
                name: this.name
            }).then(response => {
                this.selectedDrinkIndex = response.data.user.drinkIndex;
                this.answerCounter = response.data.user.numberCorrect;
                this.userID = response.data.user.id;
            this.message = "";
            this.signInScreen = false;
            this.startButton = true;
                console.log(":)");
            this.forgotten = "";
            return true;
            }).catch(error => {
                if (error.response) {
                if (error.response.status === 403){
                    this.message = "Username already Exists";
                }
                else if (error.response.status === 409)
                    return;
            }
            });
        },

        getUserDrinks: function() {
            return axios.get("/api/user/" + this.userID + "/drinkIndex")
                .then(response => {
                this.selectedDrinkIndex = response.data.user.drinkIndex;
                this.answerCounter = response.data.user.numberCorrect;
        }).catch(error => {
                console.log("sad error that we don't know what to do with: the updator")

        });
        },


        updateDrinkIndex: function() {
                var newDrink;
                if (this.selectedDrinkIndex < this.drinksAndPicturesArray.length - 1) {
                    newDrink = this.selectedDrinkIndex + 1;
                }
                else{
                    newDrink = 0;
                }
                return axios.post("/api/user/" + this.userID + "/incrementIndex", {
                    id: this.userID,
                    drinkIndex: newDrink,
                    numberCorrect: this.answerCounter
                }).then(response => {
        }).catch(error => {
            console.log("sad error that we don't know what to do with: the incrementor")
        });
        },

        /*updateAccount: function () {
            axios.put("api/credentials/update/", {
                username: this.username,
                guessedDrinks: this.guessedDrinks,
                answerCounter: this.answerCounter
            }).then(response => {
                console.log("happiness :D");
            }).catch(err => {
            });
        },
*/
        deleteAccountAreYouSure: function () {
                this.startButton = false;
                this.nextQuestionButton = false;
                this.signInScreen = false;
                this.quizScreen = false;
                this.areYouSureMessage = true;
        },

        deleteAccountNo: function () {
            this.areYouSureMessage = false;
            this.quizScreen = true;
        },

        deleteAccountYes: function () {
            return axios.delete("/api/user/" + this.userID).then(response => {
                this.signOut();
                this.guessedDrinks = this.drinkIndexesArray;
                this.message = "Success! Account Deleted! Stay sober! :)";
            }).catch(error => {
                console.log("Devon told me to make an error message in the delete function")
            });
        },

        signOut: function(){
            this.startButton = false;
            this.nextQuestionButton = false;
            this.signInScreen = true;
            this.quizScreen = false;
            this.areYouSureMessage = false;
            this.answerCounter = 0;
            this.username = "";
            this.userID = "";
            this.name = "";
            this.password = "";
            this.answerCounter = "";
            this.guessedDrinks = this.drinkIndexesArray;
        },


        forgotPassword: function () {
            this.forgotPass = false;
            this.forgotten = "Nope, too bad."
        },

        prettyPlease: function () {
            this.forgotPass = true;
            this.forgotten = "What do you think we're running here?";
        },

        start: function() {
            this.startButton = false;
            this.quizScreen = true;
            this.getUserDrinks();
            this.setCurrentDrink();
            this.selectAnswer();
            this.setAnswers();
        },
        nextQuestion: function() {
            this.nextQuestionButton = false;
            this.start();
        },

        selectAnswer: function() {
            var randNum = Math.floor(Math.random() * (this.answerArray.length));
            this.currentCorrectAnswer = this.answerArray[randNum];
        },

        selectDrink: function () {
            var randNum = Math.floor(Math.random() * (this.drinksAndPicturesArray.length));
           return this.drinksAndPicturesArray[randNum].strDrink;
        },

        selectCorrectResponse: function(){
            var randNum = Math.floor(Math.random() * (this.correctArray.length));
            return this.correctArray[randNum];
        },

        selectIncorrectResponse: function(){
            var randNum = Math.floor(Math.random() * (this.incorrectArray.length));
            return this.incorrectArray[randNum];
        },

        setAnswers: function(){
            if ("answerA" === this.currentCorrectAnswer){
                this.answerA = this.currentDrink;
            }
            else{
                do{
                    this.answerA = this.selectDrink();
                }while(this.answerA === this.currentDrink);
            }
            if ("answerB" === this.currentCorrectAnswer){
                this.answerB = this.currentDrink;
            }
            else{
                do{
                    this.answerB = this.selectDrink();
                }while((this.answerB === this.currentDrink) || (this.answerB === this.answerA));
            }
            if("answerC" === this.currentCorrectAnswer){
                this.answerC = this.currentDrink;
            }
            else{
                do{
                    this.answerC = this.selectDrink();
                }while(this.answerC === this.currentDrink || (this.answerC === this.answerA) ||
                (this.answerC === this.answerB));
            }
            if("answerD" === this.currentCorrectAnswer){
                this.answerD = this.currentDrink;
            }
            else{
                do{
                    this.answerD = this.selectDrink();
                }while(this.answerD === this.currentDrink || (this.answerD === this.answerA) ||
                (this.answerD === this.answerB) || (this.answerD === this.answerC));
            }
        },


        A: function() {
            if (this.answerA === this.currentDrink) {
                this.results = this.selectCorrectResponse();
                ++this.answerCounter;
            }
            else {
                this.results = this.selectIncorrectResponse();
            }
            this.updateDrinkIndex();
            this.nextQuestionButton = true;
        },
        B: function() {
            if (this.answerB === this.currentDrink) {
                this.results = this.selectCorrectResponse();
                ++this.answerCounter;
            }
            else {
                this.results = this.selectIncorrectResponse();
            }
            this.updateDrinkIndex();
            this.nextQuestionButton = true;
        },
        C: function() {
            if (this.answerC === this.currentDrink) {
                this.results = this.selectCorrectResponse();
                ++this.answerCounter;
            }
            else {
                this.results = this.selectIncorrectResponse();
            }
            this.updateDrinkIndex();
            this.nextQuestionButton = true;
        },
        D: function() {
            if (this.answerD === this.currentDrink) {
                this.results = this.selectCorrectResponse();
                ++this.answerCounter;
            }
            else {
                this.results = this.selectIncorrectResponse();
            }
            this.updateDrinkIndex();
            this.nextQuestionButton = true;
        },

        setCurrentDrink: function() {
            if(this.drinkIndex >= this.drinksAndPicturesArray.length){
                let tempDrinkIndex = Math.floor(Math.random() * (this.drinksAndPicturesArray.length));
                this.currentDrink = this.drinksAndPicturesArray[tempDrinkIndex].strDrink;
                this.currentPicture = this.drinksAndPicturesArray[tempDrinkIndex].strDrinkThumb;
            }
            else {
                this.currentDrink = this.drinksAndPicturesArray[this.selectedDrinkIndex].strDrink;
                this.currentPicture = this.drinksAndPicturesArray[this.selectedDrinkIndex].strDrinkThumb;
            }
        },

        cocktail: function() {
            fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail').then(response => {
                return response.json();
        }).then(json => {
            console.log(json);
            this.drinksAndPicturesArray = json.drinks;
            this.max = this.drinksAndPicturesArray.length - 1;
            for (var i = 0; i < this.drinksAndPicturesArray.length; ++i){
                this.drinkIndexesArray[i] = i;
            }
            this.guessedDrinks = this.drinkIndexesArray;
            var randNum = Math.floor(Math.random() * (this.drinkIndexesArray.length));
            this.selectedDrinkIndex = this.drinkIndexesArray[randNum];
            this.setCurrentDrink()
            return true;
        }).catch(err => {
            })
    }
    }});