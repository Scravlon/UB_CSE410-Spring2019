var seats = [3,2,1,1,3];
var balance = [5,5,5,5,5];
var lastRef = 0;
var name1 = "chungmoo";
var ref1 = "seoul";
var date1 ="may202019";

var name2 = "kevin";
var ref2 = "kl";
var date2 ="jun212019";

App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  chairPerson:null,
  currentAccount:null,
  init: function() {
    $.getJSON('../proposals.json', function(data) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');

      for (i = 0; i < data.length; i ++) {
        proposalTemplate.find('.panel-title').text(data[i].name);
        proposalTemplate.find('.btn-vote').attr('data-id', data[i].id);

        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }
    });
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    App.populateAddress();
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Consortium.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var voteArtifact = data;
    App.contracts.response = TruffleContract(voteArtifact);

    // Set the provider for our contract
    App.contracts.response.setProvider(App.web3Provider);
    
    App.getChairperson();
    return App.bindEvents();
  });
  },

  bindEvents: function() {

    $(document).on('click', '.btn-sbsb', App.handlesbsb);
    $(document).on('click', '#unregister', function(){ var ad = $('#enter_address').val(); App.handleUnRegister(ad); });
    $(document).on('click', '.btn-vote', App.handleVote);
    $(document).on('click', '#win-count', App.handleWinner);
    $(document).on('click', '#register', function(){ var ad = $('#enter_address').val(); App.handleRegister(ad); });
  },

  populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);  
        }
      });
    });
  },

  getChairperson : function(){
    App.contracts.response.deployed().then(function(instance) {
      return instance;
    }).then(function(result) {
      App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
      App.currentAccount = web3.eth.coinbase;
      if(App.chairPerson != App.currentAccount){
        jQuery('#address_div').css('display','none');
        jQuery('#register_div').css('display','none');
      }else{
        jQuery('#address_div').css('display','block');
        jQuery('#register_div').css('display','block');
      }
    })
  },
  handleUnRegister: function(addr){

    var voteInstance;
    App.contracts.response.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.unregister(addr);
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " unregistration done successfully")
            else
            alert(addr + " unregistration not done successfully due to revert")
        } else {
            alert(addr + " unregistration failed")
        }   
    });
},
  handleRegister: function(addr){
    var voteInstance;
    App.contracts.response.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.register(addr,1);
    }).then(function(result, err){
        if(result){
            if(parseInt(result.receipt.status) == 1)
            alert(addr + " registration done successfully")
            else
            alert(addr + " registration not done successfully due to revert")
        } else {
            alert(addr + " registration failed")
        }   
    });
},
handlesbsb:function(event) {
   var name = $("#name").val();
   var ref = $("#ref").val();
   var date = $("#date").val();

  if(name == name1 && ref == ref1 && date == date1){
	alert("customer is in Airline A");
$(".cross").hide();
$(".tick").show();
return;
  }
if(name == name2 && ref == ref2 && date == date2){
	alert("customer is in Airline A");
$(".cross").hide();
$(".tick").show();
return;
  }
$(".cross").show();
$(".tick").hide();

alert("customer not found");


  }
,
handlesbure: function(event) {
    event.preventDefault();
   
    var voteInstance;

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log('account', account);

      App.contracts.response.deployed().then(function(instance) {
        voteInstance = instance;
        console.log('pressed');

        return voteInstance.unregister({from: account});
      }).then(function(result, err){
           
        });
    });
  }

,
  handleVote: function(event) {
    event.preventDefault();
   // 
   var proposalId = parseInt($(event.target).data('id'));
    
    if(seats[proposalId] == 0){
	alert("Airline " + proposalId + " is full.");
	return;	
	}
    console.log('id', proposalId);
    var voteInstance;

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];
      console.log('account', account);

      App.contracts.response.deployed().then(function(instance) {
        voteInstance = instance;
        console.log('pressed');

        return voteInstance.response(proposalId, {from: account});
      }).then(function(result, err){
            if(result){
                console.log(result.receipt.status);      
	          if(parseInt(result.receipt.status) == 1){
      		          alert(account + " airline updated to " + proposalId);
				balance[proposalId] += 1;
				balance[lastRef] -= 1;

			  alert("Airline "+proposalId+" new balance: " + balance[proposalId] +". Airline "+lastRef+" new balance: " + balance[lastRef]);
			seats[lastRef]= seats[lastRef] +1;
			seats[proposalId] = seats[proposalId] -1;
			lastRef = proposalId;
lastRef = proposalId;
			$("#header ul").append("<li>"+account+": is flying with Airline " + proposalId +"</li>");}
                else{
      		          alert(account + " airline changed not done successfully due to revert")}
            } else {
                alert(account + " changing failed")
            }   
        });
    });
  },

  handleWinner : function() {
    console.log("To get winner");
    var voteInstance;
    App.contracts.vote.deployed().then(function(instance) {
      voteInstance = instance;
      return voteInstance.reqWinner();
    }).then(function(res){
    console.log(res);
      alert(App.names[res] + "  is the winner ! :)");
    }).catch(function(err){
      console.log(err.message);
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
