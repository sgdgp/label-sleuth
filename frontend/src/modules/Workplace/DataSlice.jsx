/*
    Copyright (c) 2022 IBM Corp.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import fileDownload from 'js-file-download'
import { BASE_URL, WORKSPACE_API, DOWNLOAD_LABELS_API, UPLOAD_LABELS_API } from "../../config"
import { handleError } from '../../utils/utils'
import { sidebarOptionEnum } from '../../const'

export const initialState = {
    workspaceId: "",
    curDocId: 0,
    curDocName: "",
    documents: [],
    elements: [],
    categories: [],
    curCategory: null,
    ready: false,
    num_cur_batch: 0,
    elementsToLabel: [],
    focusedIndex: null,
    focusedState: [],
    labelState: [],
    searchResult: null,
    searchUniqueElemRes: null,
    searchTotalElemRes: null,
    searchLabelState: [],
    posPredResult: [],
    posElemResult: [],
    disagreeElemResult: [],
    suspiciousElemResult:[],
    contradictiveElemDiffsResult: [],
    contradictiveElemPairsResult: [],
    posPredFraction: 0,
    posPredTotalElemRes: null,
    posPredLabelState: [],
    posElemLabelState: [],
    disagreeElemLabelState: [],
    suspiciousElemLabelState: [],
    contradictiveElemPairsLabelState: [],
    recommendToLabelState: [],
    model_version: null,
    indexPrediction: 0,
    predictionForDocCat: [],
    modelUpdateProgress: 0,
    new_categories: [],
    pos_label_num: 0,
    neg_label_num: 0,
    pos_label_num_doc: 0,
    neg_label_num_doc: 0,
    training_batch: 5,
    cur_completed_id_in_batch: 0,
    isDocLoaded: false,
    isCategoryLoaded: false,
    numLabel: { pos: 0, neg: 0 },
    numLabelGlobal: {},
    searchedIndex:0,
    isSearchActive: false,
    activePanel: "",
    searchInput: null,
    // tells if there is a model training. The word 'should' is used because the value is calculated 
    // and it does not always come from the backend
    nextModelShouldBeTraining: false,
    // tells if the user visited the workspace at least once to open the tutorial the first time
    workspaceVisited: false,
    uploadedLabels: null,
    errorMessage: null,
    deletingCategory: false,
    uploadingLabels: false,
    downloadingLabels: false,
    loadingContradictingLabels: false,
    loadingEvaluation: false,
    evaluationInProgress: false,
    evaluationElements: [],
    evaluationLabelState: {},
    initialEvaluationLabelState: {},
    evaluationScore: null,
}

const getWorkspace_url = `${BASE_URL}/${WORKSPACE_API}`

const getCategoryQueryString = (curCategory) => {
    return curCategory !== null ? `category_id=${curCategory}` : null
}

const getQueryParamsString = (queryParams) => {
    let queryParamsString = ''
    queryParams.forEach(param => {
        queryParamsString = param ? `${queryParamsString}${param}&` : queryParamsString
    })
    // add leading '?' removes last '&'
    queryParamsString = '?' + queryParamsString.substring(0, queryParamsString.length-1)
    // return an empty string if there are no query params
    return queryParamsString === '?' ? '' : queryParamsString
}

export const fetchDocuments = createAsyncThunk('workspace/fetchDocuments', async (request, { getState }) => {

    const state = getState()
    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/documents`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const getLabelNext = createAsyncThunk('workspace/getElementToLabel', async (request, { getState }) => {

    const state = getState()
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/active_learning${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})



export const getPosPredElementForCategory = createAsyncThunk('workspace/getPosPredElementForCategory', async (request, { getState }) => {

    const state = getState()

    const curDocument = state.workspace.documents[state.workspace.curDocId]['document_id']
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    //var url = `${getWorkspace_url}/${state.workspace.workspace}/positive_elements?${getCategoryQueryString(state.workspace.curCategory)}`)

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/document/${encodeURIComponent(curDocument)}${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const getAllPositiveLabels = createAsyncThunk('workspace/getPositiveElements', async (request, { getState }) => {

    const state = getState()
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    const url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/positive_elements${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())
    return data
})

export const getDisagreementsElements = createAsyncThunk('workspace/getDisagreeElements', async (request, { getState }) => {

    const state = getState()

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    const url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/disagree_elements${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())
    return data
})

export const getSuspiciousLabels = createAsyncThunk('workspace/getSuspiciousElements', async (request, { getState }) => {

    const state = getState()
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    const url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/suspicious_elements${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())
    return data
})

export const getContradictingLabels = createAsyncThunk('workspace/getContradictiveElements', async (request, { getState }) => {
    const state = getState()
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    const url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/contradiction_elements${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())
    return data
})


export const getPositivePredictions = createAsyncThunk('workspace/getPositivePredictions', async (request, { getState }) => {

    const state = getState()
    const queryParams = getQueryParamsString([
        `size=100`, 
        getCategoryQueryString(state.workspace.curCategory),
        `start_idx=0`])
    const url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/positive_predictions${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const createCategoryOnServer = createAsyncThunk('workspace/createCategoryOnServer', async (request, { getState }) => {

    const state = getState()

    const { category } = request

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/category`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        body: JSON.stringify({
            'category_name': category,
            'category_description': "",
            'update_counter': true
        }),
        method: "POST"
    }).then(response => response.json())

    return data
})

export const deleteCategory = createAsyncThunk('workspace/deleteCategory', async (request, { getState }) => {

    const state = getState()

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/category/${state.workspace.curCategory}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "DELETE"
    }).then(response => response.json())

    return data
})

export const editCategory = createAsyncThunk('workspace/editCategory', async ({newCategoryName, newCategoryDescription}, { getState }) => {

    const state = getState()

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/category/${state.workspace.curCategory}`

    const body = JSON.stringify({
        category_name: newCategoryName,
        category_description: newCategoryDescription
    })

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        body: body,
        method: "PUT"
    }).then(response => response.json())

    return data
})

export const searchKeywords = createAsyncThunk('workspace/searchKeywords', async (request, { getState }) => {
    const state = getState()
    const queryParams = getQueryParamsString([
        `qry_string=${state.workspace.searchInput}`, 
        getCategoryQueryString(state.workspace.curCategory),
        `sample_start_idx=0`])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/query${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const fetchNextDocElements = createAsyncThunk('workspace/fetchNextDoc', async (request, { getState }) => {

    const state = getState()

    const curDocument = state.workspace.documents[state.workspace.curDocId + 1]['document_id']

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])
    
    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/document/${encodeURIComponent(curDocument)}${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const fetchPrevDocElements = createAsyncThunk('workspace/fetchPrevDoc', async (request, { getState }) => {

    const state = getState()

    const curDocument = state.workspace.documents[state.workspace.curDocId - 1]['document_id']
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/document/${encodeURIComponent(curDocument)}${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const fetchElements = createAsyncThunk('workspace/fetchElements', async (request, { getState }) => {

    const state = getState()

    const curDocument = state.workspace.documents[state.workspace.curDocId]['document_id']

    var url = null;
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])
    url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/document/${encodeURIComponent(curDocument)}${queryParams}`
    
    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const fetchCertainDocument = createAsyncThunk('workspace/fetchCertainDocument', async (request, { getState }) => {
    // if(!state.workspace.curCategory){
    //     throw Error("No category was selected!") 
    // }
    const state = getState()

    const { docid, eid, switchStatus } = request

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/document/${encodeURIComponent(docid)}${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => {
        var data = response.json()
        data['eid'] = eid
        return data
    })

    return { data, eid, switchStatus }
})

export const downloadLabels = createAsyncThunk('workspace/downloadLabels', async (request, { getState }) => {

    const state = getState()

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/${DOWNLOAD_LABELS_API}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'text/csv;charset=UTF-8',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(res => res.text())

    return data
})


export const uploadLabels = createAsyncThunk(`workspace/uploadLabels`, async (formData, {getState}) => {
    const state = getState()
    let headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${state.authenticate.token}`,
    };
    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/${UPLOAD_LABELS_API}`;
    const data = await fetch(url, {
      method: "POST",
      header: headers,
      body: formData,
    }).then(res => res.json());
    return data;
  }
);

export const labelInfoGain = createAsyncThunk('workspace/labeled_info_gain', async (request, { getState }) => {

    const state = getState()
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/labeled_info_gain${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const fetchCategories = createAsyncThunk('workspace/get_all_categories', async (request, { getState }) => {

    const state = getState()

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/categories`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

export const checkModelUpdate = createAsyncThunk('workspace/check_model_update', async (request, { getState }) => {

    const state = getState()

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/models${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data

})

export const setElementLabel = createAsyncThunk('workspace/set_element_label', async (request, { getState }) => {

    const state = getState()

    const { element_id, label, docid, update_counter } = request
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/element/${encodeURIComponent(element_id)}${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        body: JSON.stringify({
            'category_id': state.workspace.curCategory,
            'value': label,
            'update_counter': update_counter
        }),
        method: "PUT"
    }).then(response => response.json())

    return data

})

export const startEvaluation = createAsyncThunk('workspace/startEvaluation', async (request, { dispatch }) => {
    await dispatch(getEvaluationElements())
})

export const getEvaluationElements = createAsyncThunk('workspace/getEvaluationElements', async (request, { getState }) => {

    const state = getState()

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/precision_evaluation_elements${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data

})

export const getEvaluationResults = createAsyncThunk('workspace/getEvaluationResults', async (changed_elements_count, { getState }) => {
    const state = getState()
    
    const ids = state.workspace.evaluationElements.map(e => e.id)
    const iteration = state.workspace.model_version - 1

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])
    
    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/precision_evaluation_elements${queryParams}`
    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        body: JSON.stringify({
            ids, 
            iteration, 
            changed_elements_count
        }),
        method: "POST"
    }).then(response => response.json())

    return data

})

export const cancelEvaluation = createAsyncThunk('workspace/cancelEvaluation', async (changed_elements_count, { getState }) => {
    const state = getState()
    
    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])
    
    var url = `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/cancel_precision_evaluation${queryParams}`
    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        body: JSON.stringify({
            changed_elements_count
        }),
        method: "POST"
    }).then(response => response.json())

    return data
})

export const checkStatus = createAsyncThunk('workspace/get_labelling_status', async (request, { getState }) => {
    const state = getState()

    const queryParams = getQueryParamsString([getCategoryQueryString(state.workspace.curCategory)])

    var url =  `${getWorkspace_url}/${encodeURIComponent(state.workspace.workspaceId)}/status${queryParams}`

    const data = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.authenticate.token}`
        },
        method: "GET"
    }).then(response => response.json())

    return data
})

const _initNewLabelState = (state, elements)  => {
    let initialLabelState = {}
    if (elements) {
        for (let i = 0; i < elements.length; i++) {
            if (state.curCategory in elements[i]['user_labels']) {
                if (elements[i]['user_labels'][state.curCategory] == 'true') {
                    initialLabelState['L' + i+'-'+elements[i].id] = 'pos'
                } else if (elements[i]['user_labels'][state.curCategory] == 'false') {
                    initialLabelState['L' + i+'-'+elements[i].id] = 'neg'
                }
                else{
                    initialLabelState['L' + i+'-'+elements[i].id] = ""
                }
            } else {
                initialLabelState['L' + i+'-'+elements[i].id] = ""
            }
        }        
    }

    return initialLabelState
}

const DataSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaceId(state, action) {
            state.workspaceId = action.payload
        },
        setIsCategoryLoaded(state, action) {
            state.isCategoryLoaded = action.payload
        },
        setIsDocLoaded(state, action) {
            state.isDocLoaded = action.payload
        },
        resetSearchResults(state, _) {
            state.searchResult = null
        }, 
        setSearchLabelState(state, action) {
            state.searchLabelState = action.payload
        }, 
        setRecommendToLabelState(state, action) {
            state.recommendToLabelState = action.payload
        },
        setPosPredLabelState(state, action) {
            state.posPredLabelState = action.payload
         },
         setPosElemLabelState(state, action) {
                 state.posElemLabelState = action.payload
         },
         setDisagreeElemLabelState(state, action) {
             state.disagreeElemLabelState = action.payload
         },
         setSuspiciousElemLabelState(state, action) {
             state.suspiciousElemLabelState = action.payload
         },
         setContradictiveElemLabelState(state, action) {
            state.contradictiveElemPairsLabelState = action.payload
        },    
        setEvaluationLabelState(state, action) {
            state.evaluationLabelState = action.payload
        },   
        setIsDocLoaded(state, action) {
            state.isDocLoaded = action.payload
        },
        setSearchedIndex(state, action) {
            state.searchedIndex = action.payload
        },
        setIsSearchActive(state, action) {
            state.isSearchActive = action.payload
        },
        setActivePanel(state, action) {
            state.activePanel = action.payload
        },
        setSearchInput(state, action) {
            state.searchInput = action.payload
        },
        setNumLabel(state, action) {
            return {
                ...state,
                numLabel: action.payload
            }
        },
        setNumLabelGlobal(state, action) {
            return {
                ...state,
                numLabelGlobal: action.payload
            }
        },
        prevPrediction(state, action) {
            const pred_index = state.indexPrediction
            if (pred_index > 0) {
                return {
                    ...state,
                    indexPrediction: pred_index - 1
                }
            } else {
                return {
                    ...state
                }
            }
        },
        updateCurCategory(state, action) {
            const c = action.payload
            return {
                ...state,
                curCategory: c,
                nextModelShouldBeTraining: false
            }
        },
        setFocusedState(state, action) {
            const id = action.payload

            var initialFocusedState = {}

            for (var i = 0; i < state['elements'].length; i++) {
                initialFocusedState['L' + i] = Object.assign({}, {[`L + ${i}`]: false});
            }

            initialFocusedState['L' + id] = true
            
            return {
                ...state,
                focusedState: initialFocusedState,
                focusedIndex: id
            }
        },
        setLabelState(state, action) {
            const new_labeled_state = action.payload
            
            return {
                ...state,
                labelState: new_labeled_state
            }
        },
        increaseIdInBatch(state, action) {
            const cur_id_in_batch = state.cur_completed_id_in_batch
            return {
                ...state,
                cur_completed_id_in_batch: cur_id_in_batch + 1
            }
        },
        cleanWorkplaceState(state, action) {
            return {
                ...initialState,
                workspaceVisited: state.workspaceVisited
            }
        },
        setWorkspaceVisited(state, action) {
            return {
                ...state,
                workspaceVisited: true
            }
        },
        clearError(state, action) {
            return {
                ...state,
                errorMessage: null
            }
        },
        cleanEvaluationState(state, action) {
            return {
                ...state,
                loadingEvaluation: false,
                evaluationInProgress: false,
                evaluationElements: [],
                evaluationLabelState: {},
                evaluationScore: null,
                initialEvaluationLabelState: {},
            }  
        },
    },
    extraReducers: {
        [fetchElements.fulfilled]: (state, action) => {
            const data = action.payload

            var initialFocusedState = {}

            for (var i = 0; i < data['elements'].length; i++) {
                initialFocusedState['L' + i] = false
            }

            var initialLabelState = {}

            var pos_label = 0

            var neg_label = 0

            for (var i = 0; i < data['elements'].length; i++) {
                if (state.curCategory in data['elements'][i]['user_labels']) {
                    if (data['elements'][i]['user_labels'][state.curCategory] == 'true') {
                        initialLabelState['L' + i] = 'pos'
                        pos_label += 1
                    } else if (data['elements'][i]['user_labels'][state.curCategory] == 'false') {
                        initialLabelState['L' + i] = 'neg'
                        neg_label += 1
                    }
                } else {
                    initialLabelState['L' + i] = ""
                }
            }

            return {
                ...state,
                elements: data['elements'],
                focusedState: initialFocusedState,
                focusedIndex: null,
                labelState: initialLabelState,
                ready: true,
                pos_label_num_doc: pos_label,
                neg_label_num_doc: neg_label
            }
        },
        [fetchCategories.fulfilled]: (state, action) => {
            const data = action.payload

            return {
                ...state,
                categories: data['categories']
            }
        },
        [fetchDocuments.fulfilled]: (state, action) => {
            const data = action.payload
            return {
                ...state,
                documents: data['documents'],
                curDocName: data['documents'][0]['document_id'],
                curDocId: 0
            }
        },
        [searchKeywords.fulfilled]: (state, action) => {
            const data = action.payload
            let initialSearchLabelState = _initNewLabelState(state, data.elements)  

            return {
                ...state,
                searchResult: data.elements,
                searchUniqueElemRes: data.hit_count_unique,
                searchTotalElemRes: data.hit_count,
                searchLabelState: initialSearchLabelState
            }
        },
        [getPositivePredictions.fulfilled]: (state, action) => {
            const data = action.payload

            return {
                ...state,
                posPredResult: data.elements,
                posPredFraction: data.positive_fraction,
                posPredTotalElemRes: data.hit_count,
                posPredLabelState: _initNewLabelState(state, data.elements)
            }
        },
        [getAllPositiveLabels.fulfilled]: (state, action) => {
            const data = action.payload

            return {
                ...state,
                posElemResult: data.positive_elements,
                posElemLabelState: _initNewLabelState(state, data.positive_elements) 
            }
        },
        [getDisagreementsElements.fulfilled]: (state, action) => {
            const data = action.payload  

            return {
                ...state,
                disagreeElemResult: data.disagree_elements,
                disagreeElemLabelState: _initNewLabelState(state, data.disagree_elements)
            }
        },
        [getSuspiciousLabels.fulfilled]: (state, action) => {
            const data = action.payload  

            return {
                ...state,
                suspiciousElemResult: data.elements,
                suspiciousElemLabelState: _initNewLabelState(state, data.elements)
            }
        },
        [getContradictingLabels.pending]: (state, action) => {
            return {
                ...state,
                loadingContradictingLabels: true,
            }
        },
        [getContradictingLabels.rejected]: (state, action) => {
            return {
                ...state,
                loadingContradictingLabels: false,
            }
        },
        [getContradictingLabels.fulfilled]: (state, action) => {
            const data = action.payload  
            let initialContrLabelState = {}
            // let contradictiveElemPairsResult = []

            if(data.pairs){
                let count = 0

                let initialContrLabelState = {}

                Object.keys(data.pairs).map((key, j) => {
                    data.pairs[key].map((res, i) => {
                        if (state.curCategory in res['user_labels']) {
                            if (res['user_labels'][state.curCategory] == 'true') {
                                initialContrLabelState['L' + count+'-'+res.id] = 'pos'
                            } else if (res['user_labels'][state.curCategory] == 'false') {
                                initialContrLabelState['L' + count+'-'+res.id] = 'neg'
                            }
                            else{
                                initialContrLabelState['L' + count+'-'+res.id] = ""
                            }
                        } else {
                            initialContrLabelState['L' + count+'-'+res.id] = ""
                        }     
                        count++
                    })
                })
            }

            const flattedPairs = data.pairs?.length ? data.pairs.flat() : []
            return {
                ...state,
                contradictiveElemDiffsResult: data.diffs,
                contradictiveElemPairsResult: data.pairs,
                contradictiveElemPairsLabelState: _initNewLabelState(state, flattedPairs),
                loadingContradictingLabels: false
            }
        },
        
        [getPosPredElementForCategory.fulfilled]: (state, action) => {
            const data = action.payload

            var elements = data['elements']

            // var doc_elements = [ ... state.elements ]

            var predictionForDocCat = Array(state.elements.length - 1).fill(false)

            elements.map((e, i) => {
                // const docid = e['docid']
                // var eids = e['id'].split('-')
                // const eid = parseInt(eids[eids.length-1])

                // if(docid == state.curDocName) {
                //     // console.log(`eid: ${eid}, i: ${i}`)

                //     predictionForDocCat[eid] = true
                // }

                if (state.curCategory in e['model_predictions']) {
                    const pred = e['model_predictions'][state.curCategory]

                    if (pred == 'true') {
                        predictionForDocCat[i] = true
                    } else {
                        predictionForDocCat[i] = false
                    }
                }


            })

            return {
                ...state,
                predictionForDocCat: predictionForDocCat
            }
        },
        [downloadLabels.pending]: (state, action) => {
            return {
                ...state,
                downloadingLabels: true
            }
        },
        [downloadLabels.fulfilled]: (state, action) => {
            const data = action.payload
            const current = new Date();
            const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
            const fileName = `labeleddata_from_Label_Sleuth<${date}>.csv`
            fileDownload(data, fileName)
            return {
                ...state,
                downloadingLabels: false
            }
        },
        [uploadLabels.pending]: (state, action) => {
            return {
                ...state,
                uploadingLabels: true
            }
        },
        [uploadLabels.fulfilled]: (state, action) => {
            return {
                ...state,
                uploadedLabels: action.payload,
                uploadingLabels: false
            }
        },
        [fetchNextDocElements.fulfilled]: (state, action) => {
            const data = action.payload

            var initialFocusedState = {}

            for (var i = 0; i < data['elements'].length; i++) {
                initialFocusedState['L' + i] = false
            }

            var initialLabelState = {}

            var pos_label = 0

            var neg_label = 0

            for (var i = 0; i < data['elements'].length; i++) {
                if (state.curCategory in data['elements'][i]['user_labels']) {
                    if (data['elements'][i]['user_labels'][state.curCategory] == 'true') {
                        initialLabelState['L' + i] = 'pos'
                        pos_label += 1
                    } else if (data['elements'][i]['user_labels'][state.curCategory] == 'false') {
                        initialLabelState['L' + i] = 'neg'
                        neg_label += 1
                    }
                } else {
                    initialLabelState['L' + i] = ""
                }
            }

            return {
                ...state,
                elements: data['elements'],
                curDocId: state.curDocId + 1,
                curDocName: state['documents'][state.curDocId + 1]['document_id'],
                focusedState: initialFocusedState,
                focusedIndex: null,
                labelState: initialLabelState,
                ready: true,
                pos_label_num_doc: pos_label,
                neg_label_num_doc: neg_label
            }
        },
        [fetchPrevDocElements.fulfilled]: (state, action) => {
            const data = action.payload

            var initialFocusedState = {}

            for (var i = 0; i < data['elements'].length; i++) {
                initialFocusedState['L' + i] = false
            }

            var initialLabelState = {}

            var pos_label = 0

            var neg_label = 0

            for (var i = 0; i < data['elements'].length; i++) {
                if (state.curCategory in data['elements'][i]['user_labels']) {
                    if (data['elements'][i]['user_labels'][state.curCategory] == 'true') {
                        initialLabelState['L' + i] = 'pos'
                        pos_label += 1
                    } else if (data['elements'][i]['user_labels'][state.curCategory] == 'false') {
                        initialLabelState['L' + i] = 'neg'
                        neg_label += 1
                    }
                } else {
                    initialLabelState['L' + i] = ""
                }
            }

            return {
                ...state,
                elements: data['elements'],
                curDocId: state.curDocId - 1,
                curDocName: state['documents'][state.curDocId - 1]['document_id'],
                focusedState: initialFocusedState,
                focusedIndex: null,
                labelState: initialLabelState,
                ready: true,
                pos_label_num_doc: pos_label,
                neg_label_num_doc: neg_label
            }
        },
        [setElementLabel.fulfilled]: (state, action) => {
            const {element} = action.payload
            const label = element.user_labels[state.curCategory]
            let newPosElemResult = [...state.posElemResult]
            if (label === 'true') {
                if (!state.posElemResult.some(e => e.id === element.id)) {
                    newPosElemResult = [...newPosElemResult, element]
                }
            }
            else {
                newPosElemResult = newPosElemResult.filter(e => e.id !== element.id)
            }
            return {
                ...state,
                posElemResult: newPosElemResult,
                posElemLabelState: _initNewLabelState(state, newPosElemResult)
            }
        },
        [getLabelNext.fulfilled]: (state, action) => {

            const data = action.payload

            let initRecommendToLabelState = {}

            for (let i = 0; i < data['elements'].length; i++) {
                if (state.curCategory in data['elements'][i]['user_labels']) {
                    if (data['elements'][i]['user_labels'][state.curCategory] == 'true') {
                        initRecommendToLabelState['L' + i+'-'+data['elements'][i].id] = 'pos'
                    } else if (data['elements'][i]['user_labels'][state.curCategory] == 'false') {
                        initRecommendToLabelState['L' + i+'-'+data['elements'][i].id] = 'neg'
                    }
                    else{
                        initRecommendToLabelState['L' + i+'-'+data['elements'][i].id] = ""
                    }
                } else {
                    initRecommendToLabelState['L' + i+'-'+data['elements'][i].id] = ""
                }
            }
            return {
                ...state,
                elementsToLabel: data['elements'],
                recommendToLabelState: initRecommendToLabelState,
                ready: true
            }
        },
        [checkModelUpdate.fulfilled]: (state, action) => {
            const data = action.payload
            let latest_model_version = -1
            let models = data['models']
            let modelReadyFound = false
            let nextModelShouldBeTraining
            while (models.length && !modelReadyFound) {
                let last_model = models[models.length-1]
                if (last_model['active_learning_status'] === 'READY') {
                    latest_model_version = last_model['iteration']
                    modelReadyFound = true
                }
                else {
                    models.pop()
                }
            }
            
            // if there is a model available, start counting the version from 1 (not 0)
            if (latest_model_version >= 0) {
                latest_model_version += 1
            }

            // logic to manage the next model status, it is first set to true in checkStatus when progress is 100

            // if there are non-ready models, it means that a model is training
            if (!modelReadyFound && models.length) {
                nextModelShouldBeTraining = true
            }
            // if there are no models yet, next model status depends on 
            // progress bar having been full or not
            else if (!models.length) {
                nextModelShouldBeTraining = state.nextModelShouldBeTraining
            } 
            // if there is at least one ready model found, next model status depends on 
            // the last ready model is already known. If it is not the same means training has
            // finished
            else if (modelReadyFound) {
                nextModelShouldBeTraining = latest_model_version === state.model_version ? state.nextModelShouldBeTraining : false
            }            

            // console.log(`models.length: ${models.length}\nfound: ${found}\nnextModelShouldBeTraining: ${state.nextModelShouldBeTraining}\nmodel_version: ${state.model_version}\nlatest_model_version: ${latest_model_version}\n\nnextModelShouldBeTraining: ${nextModelShouldBeTraining}`)

            return {
                ...state,
                model_version: latest_model_version,
                nextModelShouldBeTraining: nextModelShouldBeTraining
            }

        },
        [fetchCertainDocument.fulfilled]: (state, action) => {

            const response = action.payload
            const data = response['data']
            const eid = response['eid']
            const status = response['switchStatus']

            var initialFocusedState = {}

            for (var i = 0; i < data['elements'].length; i++) {
                initialFocusedState['L' + i] = false
            }

            initialFocusedState['L' + eid] = true
            
            /* TODO - check if it is still needed */

            // var initialLabelState = null

            // console.log(`status: ${status}`)

            // if (status == 'switch') {

            //     initialLabelState = {}

            //     console.log(`switch status`)

            //     for (var i = 0; i < data['elements'].length; i++) {
            //         initialLabelState['L' + i] = ""
            //     }
            // } else {
            //     console.log(`search status`)
            //     initialLabelState = { ...state['labelState'] }
            // }
  
            var initialLabelState = {}


            for (var i = 0; i < data['elements'].length; i++) {
                if (state.curCategory in data['elements'][i]['user_labels']) {
                    if (data['elements'][i]['user_labels'][state.curCategory] == 'true') {
                        initialLabelState['L' + i] = 'pos'
                    } else if (data['elements'][i]['user_labels'][state.curCategory] == 'false') {
                        initialLabelState['L' + i] = 'neg'
                    }
                } else {
                    initialLabelState['L' + i] = ""
                }
            }

            var DocId = -1


            state.documents.map((d, i) => {
                const curDocument = data['elements'][0]['docid']
                if (d['document_id'] == curDocument) {
                    DocId = i
                    return
                }
            })

            if (DocId == -1) {
                console.log(`No Doc found with docid: ${data['elements'][0]['docid']}`)
            }

            return {
                ...state,
                elements: data['elements'],
                curDocId: DocId,
                curDocName: state['documents'][DocId]['document_id'],
                focusedState: initialFocusedState,
                focusedIndex: null,
                labelState: initialLabelState,
                ready: true,
            }
        },
        [checkStatus.fulfilled]: (state, action) => {
            const response = action.payload
            const progress = response['progress']['all']
            var new_id_in_batch = state.cur_completed_id_in_batch
            var pos_label = state['pos_label_num']
            var neg_label = state['neg_label_num']
            // if (state.cur_completed_id_in_batch < state.training_batch - 1 ) {
            //     status = "New model is not ready"
            // } else if (state.cur_completed_id_in_batch == state.training_batch - 1) {
            //     status = "New model is almost ready"
            // } else {
            //     status = "New model is ready"
            // }
            if (state.cur_completed_id_in_batch == state.training_batch) {
                new_id_in_batch = 0
            }

            if ('true' in response['labeling_counts']) {
                pos_label = response['labeling_counts']['true']
            } else {
                pos_label = 0
            }

            if ('false' in response['labeling_counts']) {
                neg_label = response['labeling_counts']['false']
            } else {
                neg_label = 0
            }

            return {
                ...state,
                modelUpdateProgress: progress,
                cur_completed_id_in_batch: new_id_in_batch,
                pos_label_num: pos_label,
                neg_label_num: neg_label,
                nextModelShouldBeTraining: progress === 100 ? true : state.nextModelShouldBeTraining
            }
        },
        [createCategoryOnServer.fulfilled]: (state, action) => {
            // TODO: action.payload has an update_counter field that is not used, remove it
            return {
                ...state,
                curCategory: action.payload.category_id.toString(),
                categories: [...state.categories, action.payload],
                nextModelShouldBeTraining: false
            }
        },
        [deleteCategory.pending]: (state, action) => {
            return {
                ...state,
                deletingCategory: true
            }
        },
        [deleteCategory.fulfilled]: (state, action) => {
            return {
                ...initialState,
                curDocName: state.curDocName,
                documents: state.documents,
                elements: state.elements,
                deletingCategory: false,
                categories: state.categories.filter(c => c.category_id != state.curCategory),
                activePanel: sidebarOptionEnum.SEARCH,
                workspaceId: state.workspaceId
            }
        },
        [editCategory.fulfilled]: (state, action) => {
            const { category_name, category_description } = action.payload;
            return {
              ...state,
              categories: state.categories.map((c) =>
                c.category_id == state.curCategory
                  ? {
                      ...c,
                      category_name,
                      category_description,
                    }
                  : c
              ),
            };
        },
        [uploadLabels.rejected]: (state, action) => {
            return {
                ...state,
                errorMessage: handleError(action.error)
            }
        },
        [startEvaluation.fulfilled]: (state, action) => {
            return {
                ...state,
                evaluationInProgress: true,
                evaluationScore: null,
            }
        },
        [getEvaluationElements.fulfilled]: (state, action) => {
            const { elements } = action.payload
            const initialEvaluationLabelState = _initNewLabelState(state, elements)
            return {
                ...state,
                evaluationElements: elements,
                evaluationLabelState: initialEvaluationLabelState,
                initialEvaluationLabelState,
                loadingEvaluation: false
            }
        },
        [getEvaluationElements.pending]: (state, action) => {
            return {
                ...state,
                loadingEvaluation: true
            }
        },
        [getEvaluationElements.rejected]: (state, action) => {
            return {
                ...state,
                loadingEvaluation: false
            }
        },
        [getEvaluationResults.fulfilled]: (state, action) => {
            const { score } = action.payload

            return {
                ...state,
                evaluationScore: score,
                loadingEvaluation: false,
                evaluationInProgress: false,
            }
        },
        [getEvaluationResults.pending]: (state, action) => {
            return {
                ...state,
                loadingEvaluation: true,
            }
        },
        [getEvaluationResults.rejected]: (state, action) => {
            return {
                ...state,
                loadingEvaluation: false,
            }
        },
        [cancelEvaluation.fulfilled]: (state, action) => {
            return {
                ...state,
                evaluationInProgress: false,
                evaluationElements: [],
                evaluationLabelState: {},
                initialEvaluationLabelState: {},
            }
        },
    }
})

// selector for getting the current category name (curCategory is a category id)
export const curCategoryNameSelector = (state) => {
  return state.workspace.categories.find(
    (cat) => cat.category_id == state.workspace.curCategory
  )?.category_name;
};

  

export default DataSlice.reducer;
export const { 
    updateCurCategory,
    increaseIdInBatch,
    prevPrediction,
    setWorkspace,
    setFocusedState,
    setWorkspaceId,
    setIsCategoryLoaded,
    setIsDocLoaded,
    resetSearchResults,
    setSearchLabelState,
    setRecommendToLabelState,
    setPosPredLabelState,
    setPosElemLabelState,
    setDisagreeElemLabelState,
    setSuspiciousElemLabelState,
    setContradictiveElemLabelState,
    setEvaluationLabelState,
    setLabelState,
    cleanWorkplaceState,
    setNumLabelGlobal,
    setNumLabel,
    setSearchedIndex,
    setIsSearchActive,
    setActivePanel,
    setSearchInput,
    setWorkspaceVisited,
    clearError,
    cleanEvaluationState
 } = DataSlice.actions;