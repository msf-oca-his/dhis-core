$(document).ready(function () {

    if($('#currentRunningTaskStatus').val())
    {
        setHeaderDelayMessage( $('#currentRunningTaskStatus').val() );
    }

    if ($('#isRunning').val() == 'true') 
    {
        $('.scheduling').attr('disabled', 'disabled');
        $('.scheduling input').attr('disabled', 'disabled');
        $('.scheduling select').attr('disabled', 'disabled');

    }
    else
    {
        $('.scheduling').removeAttr('disabled');
        $('.scheduling input').removeAttr('disabled');
        $('.scheduling select').removeAttr('disabled');
    }

    if ($('#dataMartStrategy').val() == 'disabled')
    {
        $('.dataMart').attr('disabled', 'disabled');
    }

    var displayOptionsFor = 
    {
        daily: function (parentClass)
        {
            updateSyncHeader("Daily", parentClass);
            $(parentClass+' .timePickerContainer').show();
        },
        weekly: function (parentClass)
        {
            updateSyncHeader("Weekly", parentClass);
            $(parentClass+' .weekPickerContainer').show();
            $(parentClass+' #weekPicker').show();
            $(parentClass+' .timePickerContainer').show();
        },

        monthly: function (parentClass)
        {
            updateSyncHeader("Monthly", parentClass);
            $(parentClass+' .weekPickerContainer').show();
            $(parentClass+' #weekPeriod').show();
            $(parentClass+' #weekPicker').show();
            $(parentClass+' .timePickerContainer').show();
        },

        yearly: function (parentClass)
        {
            updateSyncHeader("Yearly", parentClass);
            $(parentClass+' .yearPickerContainer').show();
            $(parentClass+' .timePickerContainer').show();
        }

        // default: function (parentClass)
        // {
        //     $(parentClass+' .timePickerContainer').show();
        //     $(parentClass+' .syncStartButton').show(); //TODO remove
        // }
    };

    var updateSyncHeader = function (header, parent)
    {
        $(parent+' #addSchedulerLabel').html(header);
    };

    var defaultScheduler = function () 
    {
        ($("#metadataSyncStrategy").val() == "enabled") ? $(".metadataSyncScheduler").show() : $(".metadataSyncScheduler").hide();
        ($("#dataSynchStrategy").val() == "enabled") ? $(".dataSyncScheduler").show() : $(".dataSyncScheduler").hide();
        $(".syncStartButton").show(); //TODO remove
    };

    var getSchedules = function (cronExpression)
    {
        var cronSchedules = {};
        var cronExpressionSignature = ["seconds", "minutes", "hours", "day", "month", "week"];
        cronExpression.split(" ").forEach(function (cronValue, index)
        {
            if (cronValue.indexOf("-") >= 0) 
            {
                cronSchedules.weekPeriod = cronValue;
            } 
            else 
            {
                cronSchedules[cronExpressionSignature[index]] = cronValue;
            }
        });
        return cronSchedules;
    };

    var setScheduler = function (cronExpression, parentClass)
    {
        var schedules = getSchedules(cronExpression);
        var setTime = function () {
            var time = getHour(parseInt(schedules.hours)) + ":" + getMinutes(parseInt(schedules.minutes));
            $(parentClass+' #timePicker').val(time);
            // displayOptionsFor.default(parentClass);
        };
        var setter = 
        {
            daily: function () {
                if (schedules.day == "*" && (schedules.day == schedules.month) && schedules.week == "?")
                {
                    $(parentClass+' #daily').attr("checked", true);
                    displayOptionsFor["daily"](parentClass);
                    setTime();
                    return true;
                }
            },
            weekly: function () 
            {
                if (schedules.day == "*" && (schedules.day == schedules.month)) 
                {
                    $(parentClass+' #weekly').attr("checked", true);
                    displayOptionsFor["weekly"](parentClass);
                    $(parentClass+' #weekPicker').val(schedules.week);
                    setTime();
                    return true;
                }
            },

            monthly: function () 
            {
                if (schedules.month == "*" && schedules.weekPeriod) {
                    $("#monthly").attr("checked", true);
                    displayOptionsFor["monthly"](parentClass);
                    $(parentClass+' #weekPicker').val(schedules.week);
                    $("#weekPeriodNumber").val(schedules.weekPeriod);
                    setTime();
                    return true;
                }
            },

            yearly: function ()
            {
                if (schedules.week == "?") {
                    $(parentClass+' #yearly').attr("checked", true);
                    displayOptionsFor["yearly"](parentClass);
                    $(parentClass+' #monthPicker').val(schedules.month);
                    $(parentClass+' #dayPicker').val(schedules.day);
                    setTime();
                    return true;
                }
            },

            minute: function ()
            {
                $(parentClass+' #minute').attr("checked", true);
                return true;
            },

            hourly: function ()
            {
                $(parentClass+' #hourly').attr("checked", true);
                return true;
            }
        };
        var methods = Object.keys(setter);
        for (var count = 0; count < methods.length; count++) 
        {
            if (setter[methods[count]]() == true)
            {
                return;
            }
        }
    };

    var hideOptions = function (parent)
    {
        $(parent+' .weekPickerContainer').hide();
        $(parent+' #weekPicker').hide(); //TODO remove
        $(parent+' #weekPeriod').hide(); //TODO remove

        $(parent+' .yearPickerContainer').hide();

        $(parent+' .timePickerContainer').hide();
        $(parent+' .syncStartButton').hide(); //TODO remove

        generate.month("monthPicker", parent);
        generate.days("dayPicker", 1, parent);
        generate.time("timePicker", parent);
    };

    hideOptions('.metadataSyncScheduler');
    hideOptions('.dataSyncScheduler');
    defaultScheduler();
    setScheduler($("#metadataSyncCron").val(),'.metadataSyncScheduler');
    setScheduler($("#dataSyncCron").val(),'.dataSyncScheduler');

    $(".monthPicker").unbind("change").change(function (e)
    {
        e.stopPropagation();
        var monthIndex = $(this).val();
        var parent = '.' + $(this).parent().parent().parent().attr('id');
        generate.days("dayPicker", monthIndex, parent);
    });

    $(".radio").unbind("change").change(function (e)
    {
        e.stopPropagation();
        var schedulerOption = $(this).val();
        var parent = '.' + $(this).parent().parent().parent().attr('id');
        hideOptions(parent);
        displayOptionsFor[schedulerOption](parent);
        // displayOptionsFor.default(parent);
    });

    $("#metadataSyncStrategy").unbind("change").change(function (e)
    {
        defaultScheduler();
    });

    $("#dataSynchStrategy").unbind("change").change(function (e)
    {
        defaultScheduler();
    });

    $("#submitSyncNow").unbind("click").click(function (e)
    {
        e.stopPropagation();
        $("#metadataSyncNowForm").submit();
    });

});

var getCronExpression = function (parent)
{
    var week = $(parent+" #weekPicker").val();
    var time = $(parent+" #timePicker").val().split(":");
    var period = $(parent+" #weekPeriodNumber").val();
    var month = $(parent+" #monthPicker").val();
    var day = $(parent+" #dayPicker").val();
    var selection = $('input[class=radio]:checked', parent+" .radioButtonGroup").val(); //TODO: check here also
    if(!selection) return false;

    var hours = parseInt(time[0]);
    var minutes = parseInt(time[1]);
    var SECONDS = "0";
    var compile = 
    {
        daily: function (month, day, week, period, hours, minutes)
        {
            return SECONDS.concat(" ",minutes," ",hours, " *", " * " ,"?");
        },
        monthly: function (month, day, week, period, hours, minutes)
        {
            return SECONDS.concat(" ",minutes, " ", hours," ",period," * ",week);
        },
        yearly: function (month, day, week, period, hours, minutes)
        {
            return SECONDS.concat(" ",minutes," ",hours," ",day," ",month," ?");
        },
        weekly: function (month, day, week, period, hours, minutes)
        {
            return SECONDS.concat(" ",minutes," ",hours," *"," *"," ",week);
        },
        minute: '0 0/1 * * * ?',
        hourly: '0 * * * * ?'
    };
    return compile[selection](month, day, week, period, hours, minutes);
};

function submitSchedulingForm() 
{
    
    if($("#metadataSyncStrategy").val() == "enabled" || $("#dataSynchStrategy").val() == "enabled")
    {
        var metadataSyncCron = getCronExpression('.metadataSyncScheduler');
        var dataSyncCron = getCronExpression('.dataSyncScheduler');

        if( metadataSyncCron )
        {
            $('#metadataSyncCron').val(metadataSyncCron);
            $('.scheduling').removeAttr('disabled');
            $('#schedulingForm').submit();
        }
        else 
        {
            setHeaderDelayMessage( metadata_sync_scheduler_alert );
        }

        if( dataSyncCron )
        {
            $('#dataSyncCron').val(dataSyncCron);
            $('.scheduling').removeAttr('disabled');
            $('#schedulingForm').submit();
        }
    }
    else
    {
        $('.scheduling').removeAttr('disabled');
        $('#schedulingForm').submit();
    }
}

function toggleMoreOptions()
{
    $("#moreOptionsLink").toggle();
    $("#moreOptionsDiv").toggle();
}

function toggleDataMart() 
{
    
    if ($('#dataMartStrategy').val() == 'never')
    {
        $('.dataMart').attr('disabled', 'disabled');
    }
    else
    {
        $('.dataMart').removeAttr('disabled');
    }
}
