function restrictAlphabets(e) {
    var x = e.which || x.keycode;
    if ((x >= 65 && x <= 90) || (x >= 97 && x <= 122)) 
        return true
    else
        return false
}

function restrictNumbers(e) {
    var x = e.which || e.keycode;
    if (x >= 48 && x <=57)
        return true
    else
        return false
}

function submitting(tf) {
    let txt = document.getElementById('textbox');
    let indi = document.getElementById('indices');
    let h2 = document.getElementById('h2');
    let indi_int = [], new_text = [];
    let new2 = "";

    
    // check for text.length, check for indices if it contains 0 
    if (txt.value.length > 0 && indi.value.length == txt.value.length) {
        if (!indi.value.includes('0'))
            indi.value = ''
        else {
            // indi.value has '0'
            for (let j = 0; j < txt.value.length; j++) {
                if (indi.value[j] > txt.value.length) {
                    txt.value = ''
                    indi.value = ''
                    tf = false
                }
            }

            do {
                for (let i = 0; i < indi.value.length; i++) {
                    if (tf == false)
                        break
                    if (i >= 1) {
                        for (val in indi) {
                            if (val == i){
                                tf = false
                                break
                            }
                        }
                    }
                    indi_int[i] = parseInt(indi.value[i])
                }


                if (tf == true) {
                    let x
                    for (let i = 0; i < indi_int.length; i++) {
                        x = txt.value[indi_int.indexOf(i)]
                        new_text.splice(i, 0, x)
                    }
                    new2 = new_text.join('')
                    h2.innerHTML = ""
                    h2.innerText = new2

                    tf = false
                }

            } while (tf == true)
        }
    }
    
    else {
        txt.value = ''
        indi.value = ''
    }
}