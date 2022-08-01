Hooks.on('changeSidebarTab', (directory) => {
    if (directory.tabName != 'journal')
        return;

    // ensure the custom button doesn't already exist
    let journalImportDataButton = directory.element.find('#import-data');
    if (journalImportDataButton.length > 0)
        return;

    // add custom button
    let actionButtonsHeaderRow = directory.element.find('div.header-actions');
    actionButtonsHeaderRow.append(`<button id="import-data"><i class="fas fa-book"></i> Import Journal Data</button>`);

    directory.element.on('click', '#import-data', (event) => {
    });
});
