$(document).ready(() => {
    const DATA = [];
    const coinsReport = [];
    const coinDATA = [];
    const ALL_COINS_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=99&page=1`;
    const COIN_URL = `https://api.coingecko.com/api/v3/coins/`;
    let d = new Date();
    let intrvalFlag = false;
    let interval = ""

    const $targetCtr = $(`.mainCtr>row>.card`);

    const LOADER = `<div id="loader">
             <div class="spinner-border text-primary" style="width: 7rem; height: 7rem;" role="status">
            <span class="sr-only">Loading...</span>
            </div>`;
    getAllCoins()

    $(`.nav a:nth-of-type(1)`).on(`click`, () => {
        navBAR("Home", interval);
    });
    $(`.nav a:nth-of-type(2)`).on(`click`, () => {
        navBAR("Report", interval);
    });
    $(`.nav a:nth-of-type(3)`).on(`click`, () => {
        navBAR("aboutMe", interval);
    });

    function getAllCoins() {

        $.ajax({
            url: ALL_COINS_URL,
            type: "GET",
            dataType: "json",
            beforeSend: () => {
                getLoader(`.mainCtr>.row`)
            },
            success: (card) => {
                removeLaoder()
                $.each(card, function (index, value) {
                    if (index === 100) return false;
                    DATA.push(value)
                    CrateCard(value);

                });
                console.log(DATA)
            }

        });
    };

    function navBAR(pageStatus, intrvalParm) {
        const $dynammicDiv = $(`.mainCtr>.row`).children();
        const $aboutMeRef = $('#aboutMe');
        switch (pageStatus) {
            case "Report":
                $dynammicDiv.hide();
                $aboutMeRef.hide();
                intrvalFlag = true;
                getReport();
                break;
            case "Home":
                if (intrvalFlag == true) {
                    $(`#chartContainer`).remove();
                    clearInterval(interval)
                }
                $aboutMeRef.hide();
                $(`.mainCtr>.row .card`).show();
                break;
            case "aboutMe":
                if (intrvalFlag == true) {
                    $(`#chartContainer`).remove();
                    clearInterval(interval)
                }
                $dynammicDiv.hide();
                //   $(`.mainCtr>.row>* `).hide();
                if ($aboutMeRef.length) {
                    $aboutMeRef.show()
                } else {
                    getAboutMeContent();
                }
                break;
        }
    }



    function CardElemntTemplate(DATA) {
        return $(
            `<div class="card col-lg-4 mt-3">
                        <div class="card-body">                                  
                                <span class="card-title">${DATA.symbol}</span>
                                <label class="switch" >
                                <input type="checkbox">
                                <span class="slider round"></span>
                                </label>       
                                <p  class="card-text">${DATA.name}</p> 
                  <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapse${DATA.id}" aria-expanded="false" aria-controls="collapseExample">More info</button>
                  <div class="collapse" data-name=${DATA.id} id="collapse${DATA.id}">
                </div>`);
    }

    function getInfoCoin(coninId, symbol, cardElement) {
        const $TARGET = cardElement.find(`.collapse`);
        console.log(symbol)


        $.ajax({
            url: `${COIN_URL}${coninId}`,
            type: "GET",
            dataType: "json",
            beforeSend: () => {
                $TARGET.find(`.moreInfoCard`).remove();
                getLoader($TARGET);
            },
            success: (json) => {
                coinDATA.push(createCoinObj(json))
                console.log(coinDATA);
                removeLaoder()
                $TARGET.append(
                    `<div class="moreInfoCard">
                    <img class="img-responsive d-block" src="${json.image.small}" alt="coin img">
                    <p>${json.market_data.current_price.usd}&#36;</p>
                    <p>${json.market_data.current_price.eur}&#8364;</p>
                    <p>${json.market_data.current_price.ils}&#8362;</p>
                     </div>`
                );

            }
        });

    }
    function removeToggle($TARGET) {
        $TARGET.find(`.moreInfoCard`).remove();
    }
    function CrateCard(DATA) {
        const $cardElement = CardElemntTemplate(DATA);
        $(`.mainCtr>.row`).append($cardElement);
        $cardElement.on(`shown.bs.collapse`, () => {
            getInfoCoin(DATA.id, DATA.symbol, $cardElement);
        });

        $($cardElement).find(`:checkbox`).change(function () {
            console.log(typeof (DATA.symbol))
            let $inputElement = $(this);
            let checkboxStatus = this.checked;
            coinToReportManager(checkboxStatus, DATA.symbol);
        });
    }
    function coinToReportManager(checkboxStatus, coin) {
        let Arraylength = coinsReport.length;
        if (checkboxStatus) {
            addCointToRepoertArray(coin);
            const modealFlag = $('#myModal').hasClass(`show`);
            if (Arraylength > 4 && !modealFlag) {
                console.log(`more then 5 items`);
                addDaynamicValuesToModal(coinsReport);
                $('#myModal').modal('show');
            }
        } else {
            RemoveCointToRepoertArray(coin);
        }
    }
    function addCointToRepoertArray(coinElement) {
        coinsReport.push(coinElement);
    }
    function RemoveCointToRepoertArray(coinElement) {
        index = coinsReport.findIndex(coin => coin == coinElement);
        coinsReport.splice(index, 1);
    }
    function addDaynamicValuesToModal(coinsReport) {
        $.each(coinsReport, function (index, value) {
            $(`.modal-body`).append(`
            <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${value}" checked>
            <label class="custom-control-label" for="${value}">${value}</label>
          </div>
          `)
        })
        $('#myModal').modal('show');

        $(`.modal-body`).find(`:checkbox`).change(function () {
            let checkboxStatus = this.checked;
            coinToReportManager(checkboxStatus, this.id);
            changeCheckBoxinHTML(checkboxStatus, this.id);
        });
    }

    function changeCheckBoxinHTML(checkboxStatus, value) {
        let index = DATA.findIndex(DATA => DATA.symbol == value);
        if (checkboxStatus) {
            $(`.card`).eq(index).find(`:checkbox`).prop("checked", true);
        } else {
            $(`.card`).eq(index).find(`:checkbox`).prop("checked", false);
        }
    }

    $(`#myModal`).on(`hidden.bs.modal`, () => {
        $(`.modal-body`).empty()
    })
    function createCoinObj(json) {
        return {
            "symbol": json.symbol,
            time: new Date()
        };
    }

    function coinsManager(symbol) {
        if (coinDATA.length == 0) {
            console.log(`Array is Empty`)
            return false
        } else {
            $.each(coinDATA, (index, value) => {
                if (symbol === value.symbol) {
                    console.log(`Same value`);

                    if (timeDiffChecker(value.time) == false) {
                        return false;
                    } else {
                        console.log(index);
                        coinDATA.splice(index, 1)
                        return true;
                    }
                } else {
                    return true;
                }
            });

        }
    }

    function timeDiffChecker(coinTime) {

        let currentTime = new Date();
        let diff = (currentTime - coinTime) / 1000;
        diff /= 60;
        diff = (Math.abs(Math.round(diff)))
        if (diff >= 1) {
            console.log(`time is bigger then 1 min -> retuen true`);
            return true;
        } else {
            console.log(`time is less then 1 min -> retuen false`);
            return false;
        }
    }

    $(`.form-control ~ :button `).click((e) => {
        e.preventDefault();
        searchManager();
    });
    function searchManager() {
        let userInput = $(`#input`).val().trim();
        if (userInput === "") {
            // Call to modal 
            alert(`Search values in empy`);
        } else {
            index = DATA.findIndex(DATA => DATA.id == userInput);
            if (index == -1) {
                alert(`item not exist`);
            } else {
                $(`.card`).remove();
                CrateCard(DATA[index]);
            }
        }
    }
    function getLoader(target) {
        $(target).append(LOADER);

    }
    function removeLaoder() {
        $(`#loader`).remove();
    }
    function getReport() {
        console.log(coinsReport.length)
        if (coinsReport.length === 0) {
            alert(`No coins selected, please select atleast  onc coin`);
        } else if (coinsReport.length === 6) {
            alert(`Please selcet only 5 coins `)
        } else {
            const upperCaseCoins = coinsReport.map(item => item.toUpperCase());
            createReport(upperCaseCoins);

            function createReport(upperCaseCoins) {
                const ObjCoins = []
                $.each(upperCaseCoins, (index, value) => {
                    ObjCoins.push({
                        type: 'line',
                        name: value,
                        showInLegend: true,
                        dataPoints: []
                    })
                });
                const CURRENT_COIN = `USD`
                $(`.card`).remove()
                $(`.mainCtr`).append(`<div id="chartContainer" style="height: 370px; width: 100%;"></div>`)

                var chart = new CanvasJS.Chart("chartContainer", {
                    title: {
                        text: `${upperCaseCoins} to ${CURRENT_COIN}`
                    },
                    axisX: {
                        valueFormatString: "mm:ss"
                    },
                    axisY: [{
                        title: "CoinValue",
                        lineColor: "#C24642",
                        tickColor: "#C24642",
                        labelFontColor: "#C24642",
                        titleFontColor: "#C24642",
                        suffix: "$"
                    },],

                    toolTip: {
                        shared: true
                    },
                    legend: {

                        cursor: "pointer",
                        itemclick: toggleDataSeries
                    },
                    data: []
                });
                chart.render();
                function toggleDataSeries(e) {
                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }
                    e.chart.render();
                }
                $.each(ObjCoins, (index, value) => {

                    chart.options.data.push(value);

                });
                chart.render();
                function updateReport() {
                    $.get({
                        url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${upperCaseCoins}&tsyms=${CURRENT_COIN}`,
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(`jqXHR-> ${jqXHR}`);
                            console.log(`textStatus -> ${textStatus}`);
                            console.log(`errorThrown ->  ${errorThrown}`);
                        },
                        success: response => {
                            Object.keys(response).forEach((key) => {
                                console.log(`The Response key -> ${key}`);
                                $.each(ObjCoins, (index, value) => {
                                    console.log(`The object index  -> ${index}| The Object value -> ${value.name}`)
                                    if (key === value.name) {
                                        console.log(`----- true -----------`)

                                        chart.options.data[index].dataPoints.push({ x: new Date(), y: response[key].USD });
                                        console.log(chart.data)
                                        console.log(chart.options.data)
                                        chart.render();
                                    }
                                });
                            });

                        }
                    })
                }
                interval = setInterval(updateReport, 2000);
                updateReport();



            }

        }


    }

    function getAboutMeContent() {
        const $aboutMe = `
    <div id="aboutMe">
     <h1 class="header">About me </h1>
   <div class="row">
    <div class="col-4 col-md-4">
    <img  src="./imges/rotemiluzphoto.jpg" class="img-fluid img-rounded" id="rotemiluz" alt="">
    <p class="prg">
    City : Kriyat bialik<br>
    Email: Rotemiluz53@gmail.com 
     Born:12.02.1995 
</p>
</div>
   <div class="col-8 col-md-8">
<P class="prg">
Hi, my name is Rotem iluz. I’m a Student Full Stack Developer, this is my project and the project display cryptography coin info in real time .so contact if you’d like to work together on your next project

</P>
  </div>
  </div>

`

        $(`.mainCtr>.row`).append($aboutMe);
    }
});
