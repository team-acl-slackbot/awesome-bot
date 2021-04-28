

const calendarDataParser = (parsed) => {
    const { block_id: topicBlockId } = parsed.view.blocks.find(input => input.element.type === 'plain_text_input')
    const { block_id: usersBlockId } = parsed.view.blocks.find(input => input.element.type === 'multi_users_select')
    const { block_id: dateBlockId } = parsed.view.blocks.find(input => input.element.type === 'datepicker')
    const { block_id: timeBlockId } = parsed.view.blocks.find(input => input.element.type === 'timepicker')
    
    const {'plain_text_input-action': topicInput} = parsed.view.state.values[topicBlockId]
    const {'multi_users_select-action': usersInput} = parsed.view.state.values[usersBlockId]
    const {'datepicker-action': dateInput} = parsed.view.state.values[dateBlockId]
    const {'timepicker-action': timeInput} = parsed.view.state.values[timeBlockId]
    
    const meetingTopic = topicInput['value']
    const meetingUsers = usersInput['selected_users']
    const meetingDate = dateInput['selected_date']
    const meetingTime = timeInput['selected_time']

    return {meetingTopic, meetingUsers, meetingDate, meetingTime}
}

const dateParser = (date, time) => {
    const [ yr, mn, day ] = date.split('-')
    const [ hr, min ] = time.split(':')

    // Months are 0-indexed
    return new Date(Number(yr), Number(mn) - 1, Number(day), Number(hr), Number(min), 0)
}



module.exports = {
    calendarDataParser,
    dateParser,
    
}