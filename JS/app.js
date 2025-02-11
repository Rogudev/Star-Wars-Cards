$(document).ready(function () {
    // List of characters' names
    const names = ['Chewbacca', 'Darth Vader', 'R2-D2', 'C-3PO', 'Yoda'];

    // Create the structure
    function createStructure() {
        $('body').append(`
            <div class="container">
                <div class="row">
                    <div class="col-12 text-center mt-5">
                        <button id="song" type="button" class="btn btn-lg btn-warning text-black">Start music</button>
                    </div>
                </div>
            </div> 

            <div class="row my-5 mx-0">
                <div class="col-12">
                    <h2 class="fs-1 text-center">Select one card:</h2>
                </div>
            </div>

            <div class="row mx-0">
                <div class="row mx-0">
                    <div id="cardsRow" class="col-sm-12 col-md-6 row mx-0">
                        <div id="carousel" class="carousel slide">
                            <div class="carousel-inner">

                            </div>
                            
                            <button class="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                        <div class="container text-center mt-5">
                            <button id="selectCard" type="button" class="btn btn-lg btn-warning text-black">Select</button>
                        </div>
                    </div>
                    <div id="infoRow" class="col-sm-12 col-md-6 row mx-0 border border-warning rounded text-center mt-1 pt-2">
                    </div>
                </div>
            </div> 
        `);
    }





    // Prepare the audios
    $('body').append(`
        <audio id="cantinaSong"> 
            <source src="./media/audio/cantinaSong.ogg" type="audio/webm">
            Your browser does not support the audio element.
        </audio>
    `);
    for (let i = 0; i < names.length; i++) {
        let name = names[i].replace(/\s/g, '');
        $('body').append(`
            <audio id="${name}Song"> 
                <source src="./media/audio/${names[i].toLowerCase().replace(' ', '')}Song.mp3" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        `);
    }

    // Toggle audio playback
    function backgroundSongEvent() {
        $('#song').click(function () {
            var audio = $("#cantinaSong")[0]; // Access the DOM element
            var button = $(this);

            if (audio.paused) {
                audio.play();
                button.text("Stop music");
            } else {
                audio.pause();
                button.text("Start music");
            }
        });
    }
    // Make the cards function
    function makeCards(index, name) {
        let activeClass = index === 0 ? 'active' : '';
        let cardName = name.replace(" ", "");
        $('#carousel .carousel-inner').append(`
            <div id="${cardName}Card" class="carousel-item ${activeClass}">
                <div class="d-flex justify-content-center">
                    <div class="card py-3" style="width: 13rem;">
                        <img src="./media/characters/${index + 1}.jpeg" class="card-img-top img-fluid p-3" alt="${name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${name}</h5>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // Get the character
    function getCharacter(name) {
        $.ajax({
            url: `https://swapi.dev/api/people/?search=${name}&format=json`,
            method: 'GET',
            dataType: 'json',
            success: function (character) {
                getFilmsTitles(character.results[0]);
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud:', error);
            }
        });
    }

    // Save the character into the JSON
    function getFilmsTitles(character) {
        let films = character.films;
        let filmsTitles = [];
        let promiseArray = [];

        films.forEach((film) => {
            promiseArray.push($.ajax({
                url: `${film}`,
                method: 'GET',
                dataType: 'json',
                success: function (film) {
                    filmsTitles.push(film.title)
                },
                error: function (xhr, status, error) {
                    console.error('Error en la solicitud:', error);
                }
            }))
        });

        Promise.all(promiseArray)
            .then(function (results) {
                // Send the character and the titles to the homeworld name getter
                getHomeworldName(character, filmsTitles);
            })
            .catch(function (error) {
                console.error('Error al procesar las películas:', error);
            });

    }

    function getHomeworldName(character, filmsTitles) {
        $.ajax({
            url: `${character.homeworld}`,
            method: 'GET',
            dataType: 'json',
            success: function (homeworld) {
                //Save the character into the JSON
                getSpecie(character, filmsTitles, homeworld.name);
            },
            error: function (xhr, status, error) {
                console.error('Error en la solicitud:', error);
            }
        });

    }

    function getSpecie(character, filmsTitles, homeworldName) {
        if (character.species.length !== 0) {
            $.ajax({
                url: `${character.species[0]}`,
                method: 'GET',
                dataType: 'json',
                success: function (specie) {
                    //Save the character into the JSON
                    charactersData.characters.push({
                        "name": character.name,
                        "specie": specie.name,
                        "height": character.height + " cm",
                        "birth year": character.birth_year,
                        "gender": character.gender,
                        "homeworld": homeworldName,
                        "films where appears": filmsTitles
                    });
                },
                error: function (xhr, status, error) {
                    console.error('Error en la solicitud:', error);
                }
            });

        } else {
            //Save the character into the JSON
            charactersData.characters.push({
                "name": character.name,
                "specie": "None",
                "height": character.height + " cm",
                "birth year": character.birth_year,
                "gender": character.gender,
                "homeworld": homeworldName,
                "appears in": filmsTitles
            });
        }
    }

    function makeSelectFunctions() {
        // Set the click function to the button to show the info
        $('#selectCard').click(function () {
            let charName = $('.active').attr('id').split('Card')[0]; //Extract the name from de id attribute

            charName = charName.replace(" ", " ");

            let selectedCharacter = charactersData.characters.find(character => character.name.replace(" ", "") === charName);

            // Insert the JSON data into the info div
            $('#infoRow').empty();
            $.each(selectedCharacter, function (key, value) {
                if (Array.isArray(value)) {
                    let itemsHtml = value.map(item => `<li class="text-orange list-group-item">${item}</li>`).join('');
                    $('#infoRow').append(`
                    <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong></p>
                    <ul>${itemsHtml}</ul>
                `);
                } else {
                    $('#infoRow').append(`
                    <p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> <label class="text-orange">${value}</label></p>
                `);
                }
            });

            //use the sound effect
            var audio = $(`#${charName.replace(" ", "")}Song`)[0];
            if (audio.paused) {
                audio.play();
            }
            
            document.getElementById('infoRow').scrollIntoView({ behavior: 'smooth' });
        });
    }

    //--------------------------------------------------------------------------

    // JSON to save the characters
    let charactersData = {
        "characters": []
    };

    $.each(names, function (_, name) {
        getCharacter(name);
    });

    function startApp() {
        // Start the app
        createStructure();
        // Create the cards with the caracters' names
        $.each(names, function (index, name) {
            makeCards(index, name);
        });
        makeSelectFunctions();
    }


    function progressBar() {
        let width = parseFloat($('#progressBar').css('width')); //Extract the width

        let totalWidth = $('.progress').width(); //get the actual width

        let percentage = (width / totalWidth) * 100;

        if (percentage <= 99) {
            let newWidth = percentage + 10;
            $('#progressBar').css('width', `${newWidth}%`);
            $('#progressBar').empty();

            setTimeout(progressBar, 100);
        }
        else {
            $('#loadingPage').fadeOut(1500, function () {
                startApp();
                backgroundSongEvent();
            });
        }
    }


    $('#loadingPage').hide().fadeIn(1500);

    progressBar();

});
